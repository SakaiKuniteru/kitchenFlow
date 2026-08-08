const fs = require("fs");

const path = require("path");

const ExcelJS = require("exceljs");

const ApiError = require("../../../../utils/api-error");

const pool = require("../../../../config/database");

const coSoRepository = require("./co-so.repository");

const coSoService = require("./co-so.service");

const { readExcel } = require("../../../../helpers/excel/excel-reader");

const { createErrorFile } = require("../../../../helpers/excel/excel-error");

const { sendExcel } = require("../../../../helpers/excel/excel-response");

const { toNumber, toBoolean } = require("../../../../helpers/excel/excel-value");

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

const MA_BAO_CAO = "dm_co_so";


const FIELDS = [

    "id/k",

    "maCoSo/k",

    "tenCoSo",

    "diaChi",

    "quocGiaId",

    "maQuocGia",

    "tinhThanhId",

    "maTinhThanh",

    "xaPhuongId",

    "maXaPhuong",

    "active"

];

class CoSoExcel {

    async getFileMau() {

        const sql = `
            SELECT

                id,
                ma_bao_cao,
                ten_bao_cao,
                file_mau,
                loai_xuat_file,
                active

            FROM dm_bao_cao

            WHERE LOWER(
                TRIM(ma_bao_cao)
            ) = LOWER(
                TRIM($1)
            )

            LIMIT 1
        `;


        const result =
            await pool.query(
                sql,
                [
                    MA_BAO_CAO
                ]
            );


        if (
            result.rows.length === 0
        ) {

            throw new ApiError(
                404,
                `Không tìm thấy cấu hình báo cáo "${MA_BAO_CAO}".`
            );

        }


        const row =
            result.rows[0];


        if (!row.active) {

            throw new ApiError(
                400,
                `Báo cáo "${MA_BAO_CAO}" đã bị khóa.`
            );

        }


        if (!row.file_mau) {

            throw new ApiError(
                404,
                `Báo cáo "${MA_BAO_CAO}" chưa có file mẫu.`
            );

        }


        const fileMau =
            String(
                row.file_mau
            )
                .trim()
                .replace(
                    /^\/+/,
                    ""
                );


        const duongDanFile =
            fileMau.startsWith(
                "uploads/"
            )
                ? path.join(
                    process.cwd(),
                    "src/public",
                    fileMau
                )
                : path.join(
                    process.cwd(),
                    fileMau
                );


        if (
            !fs.existsSync(
                duongDanFile
            )
        ) {

            throw new ApiError(
                404,
                `Không tìm thấy file mẫu của báo cáo "${MA_BAO_CAO}".`
            );

        }


        return {

            baoCao: {

                id:
                    row.id,

                maBaoCao:
                    row.ma_bao_cao,

                tenBaoCao:
                    row.ten_bao_cao,

                fileMau:
                    row.file_mau,

                loaiXuatFile:
                    row.loai_xuat_file

            },

            duongDanFile

        };

    }

    isBlank(
        value
    ) {

        return (
            value === undefined ||
            value === null ||
            String(
                value
            ).trim() === ""
        );

    }

    isTemplateValue(
        value
    ) {

        if (
            typeof value !==
            "string"
        ) {

            return false;

        }


        const normalized =
            value.trim();


        return (
            normalized.startsWith(
                "[["
            ) &&
            normalized.endsWith(
                "]]"
            )
        );

    }

    cloneValue(
        value
    ) {

        if (
            value === undefined ||
            value === null
        ) {

            return value;

        }


        if (
            typeof value !==
            "object"
        ) {

            return value;

        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }

    copyRowStyle(
        worksheet,
        sourceRowNumber,
        targetRowNumber
    ) {

        const sourceRow =
            worksheet.getRow(
                sourceRowNumber
            );

        const targetRow =
            worksheet.getRow(
                targetRowNumber
            );


        targetRow.height =
            sourceRow.height;


        for (
            let columnNumber = 1;
            columnNumber <=
                worksheet.columnCount;
            columnNumber++
        ) {

            const sourceCell =
                sourceRow.getCell(
                    columnNumber
                );

            const targetCell =
                targetRow.getCell(
                    columnNumber
                );


            if (
                sourceCell.style
            ) {

                targetCell.style =
                    this.cloneValue(
                        sourceCell.style
                    );

            }


            if (
                sourceCell.numFmt
            ) {

                targetCell.numFmt =
                    sourceCell.numFmt;

            }


            if (
                sourceCell.alignment
            ) {

                targetCell.alignment =
                    this.cloneValue(
                        sourceCell.alignment
                    );

            }


            if (
                sourceCell.border
            ) {

                targetCell.border =
                    this.cloneValue(
                        sourceCell.border
                    );

            }


            if (
                sourceCell.fill
            ) {

                targetCell.fill =
                    this.cloneValue(
                        sourceCell.fill
                    );

            }


            if (
                sourceCell.font
            ) {

                targetCell.font =
                    this.cloneValue(
                        sourceCell.font
                    );

            }


            if (
                sourceCell.dataValidation
            ) {

                targetCell.dataValidation =
                    this.cloneValue(
                        sourceCell.dataValidation
                    );

            }

        }

    }

    ghiDongExport(
        row,
        headerMap,
        data
    ) {

        for (
            const [
                field,
                columnNumber
            ] of headerMap
        ) {

            /*
            * Key trong Excel không phải
            * field hệ thống hỗ trợ export
            * => bỏ qua.
            */
            if (
                !Object.prototype
                    .hasOwnProperty
                    .call(
                        data,
                        field
                    )
            ) {

                continue;

            }


            const value =
                data[field];


            /*
            * Không có giá trị
            * => bỏ qua.
            *
            * false và 0 vẫn được xuất.
            */
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                continue;

            }


            row
                .getCell(
                    columnNumber
                )
                .value =
                value;

        }

    }

    getExportHeaderMap(
        worksheet
    ) {

        const headerMap =
            new Map();


        const headerRow =
            worksheet.getRow(
                HEADER_ROW
            );


        headerRow.eachCell(
            {
                includeEmpty:
                    false
            },
            (
                cell,
                columnNumber
            ) => {

                if (
                    cell.value === undefined ||
                    cell.value === null
                ) {

                    return;

                }


                const key =
                    String(
                        cell.value
                    )
                        .trim();


                if (!key) {

                    return;

                }

                const field =
                    key.endsWith(
                        "/k"
                    )
                        ? key.slice(
                            0,
                            -2
                        )
                        : key;


                headerMap.set(
                    field,
                    columnNumber
                );

            }
        );


        return headerMap;

    }

    taoDongExport(
        item
    ) {

        return {

            id:
                item.id,

            maCoSo:
                item.maCoSo,

            tenCoSo:
                item.tenCoSo,

            diaChi:
                item.diaChi,

            quocGiaId:
                item.quocGiaId,

            maQuocGia:
                item.quocGia?.ma ??
                null,

            tinhThanhId:
                item.tinhThanhId,

            maTinhThanh:
                item.tinhThanh?.ma ??
                null,

            xaPhuongId:
                item.xaPhuongId,

            maXaPhuong:
                item.xaPhuong?.ma ??
                null,

            active:
                item.active

        };

    }

    exportData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const {
                    baoCao,
                    duongDanFile
                } =
                    await this
                        .getFileMau();


                const workbook =
                    new ExcelJS.Workbook();


                try {

                    await workbook.xlsx
                        .readFile(
                            duongDanFile
                        );

                } catch (error) {

                    throw new ApiError(
                        400,
                        "Không thể đọc file mẫu cơ sở."
                    );

                }


                const worksheet =
                    workbook.worksheets[0];


                if (!worksheet) {

                    throw new ApiError(
                        400,
                        "File mẫu cơ sở không có sheet dữ liệu."
                    );

                }

                const headerMap =
                    this.getExportHeaderMap(
                        worksheet
                    );


                const danhSach =
                    await coSoRepository
                        .getTongHop(
                            req.query
                        );


                for (
                    let index = 0;
                    index <
                        danhSach.length;
                    index++
                ) {

                    const rowNumber =
                        DATA_START_ROW +
                        index;


                    if (
                        rowNumber !==
                        TEMPLATE_ROW
                    ) {

                        this.copyRowStyle(
                            worksheet,
                            TEMPLATE_ROW,
                            rowNumber
                        );

                    }


                    const data =
                        this.taoDongExport(
                            danhSach[
                                index
                            ]
                        );


                    const row =
                        worksheet.getRow(
                            rowNumber
                        );

                    this.ghiDongExport(
                        row,
                        headerMap,
                        data
                    );


                    row.commit();

                }

                if (
                    danhSach.length === 0
                ) {

                    const row =
                        worksheet.getRow(
                            DATA_START_ROW
                        );


                    for (
                        const columnNumber of
                        headerMap.values()
                    ) {

                        row
                            .getCell(
                                columnNumber
                            )
                            .value =
                            null;

                    }

                }


                const buffer =
                    await workbook.xlsx
                        .writeBuffer();


                return sendExcel(
                    res,
                    {

                        fileName:
                            `${MA_BAO_CAO}.xlsx`,

                        buffer

                    }
                );

            } catch (error) {

                next(
                    error
                );

            }

        };

    validateHeaders(
        headerMap
    ) {

        const hasIdKey =
            headerMap.has(
                "id/k"
            );


        const hasMaKey =
            headerMap.has(
                "maCoSo/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maCoSo"
            );


        /*
        * Phải có một field mã
        * để xác định cách xử lý import.
        */
        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maCoSo hoặc maCoSo/k."
            );

        }


        /*
        * Không được tồn tại đồng thời:
        *
        * maCoSo
        * maCoSo/k
        */
        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maCoSo và maCoSo/k."
            );

        }


        return {

            hasIdKey,

            hasMaKey,

            hasMaNormal,

            /*
            * Lưu lại chính xác các key
            * thực sự có trong file.
            */
            fieldsCoTrongFile:
                new Set(
                    [
                        ...headerMap.keys()
                    ]
                )

        };

    }

    async docDuLieuImport(
        file
    ) {

        const {
            workbook,
            worksheet,
            headerMap,
            getValue
        } =
            await readExcel(
                file,
                {
                    headerRowNumber:
                        HEADER_ROW
                }
            );


        const cauHinhKhoa =
            this.validateHeaders(
                headerMap
            );


        const {
            fieldsCoTrongFile
        } =
            cauHinhKhoa;


        const danhSach =
            [];


        /*
        * =========================================================
        * HELPER
        * =========================================================
        */

        const getOptionalValue =
            (
                row,
                field
            ) => {

                /*
                * File không có key
                * => bỏ qua.
                */
                if (
                    !fieldsCoTrongFile
                        .has(
                            field
                        )
                ) {

                    return undefined;

                }


                const value =
                    getValue(
                        row,
                        field
                    );


                /*
                * Có key nhưng ô trống
                * => bỏ qua.
                */
                if (
                    this.isBlank(
                        value
                    )
                ) {

                    return undefined;

                }


                if (
                    typeof value ===
                    "string"
                ) {

                    return value.trim();

                }


                return value;

            };


        const getOptionalNumber =
            (
                row,
                field,
                label
            ) => {

                const value =
                    getOptionalValue(
                        row,
                        field
                    );


                if (
                    value === undefined
                ) {

                    return undefined;

                }


                const number =
                    toNumber(
                        value
                    );


                /*
                * Ô có dữ liệu nhưng không đổi
                * được thành số.
                */
                if (
                    number === null
                ) {

                    throw new ApiError(
                        400,
                        `${label} không hợp lệ.`
                    );

                }


                return number;

            };


        const getOptionalBoolean =
            (
                row,
                field
            ) => {

                const value =
                    getOptionalValue(
                        row,
                        field
                    );


                if (
                    value === undefined
                ) {

                    return undefined;

                }


                try {

                    return toBoolean(
                        value
                    );

                } catch (error) {

                    throw new ApiError(
                        400,
                        "Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE."
                    );

                }

            };


        /*
        * =========================================================
        * ĐỌC TỪNG DÒNG
        * =========================================================
        */

        for (
            let rowNumber =
                DATA_START_ROW;
            rowNumber <=
                worksheet.rowCount;
            rowNumber++
        ) {

            const row =
                worksheet.getRow(
                    rowNumber
                );


            /*
            * Không quét theo cột 1, 2, 3...
            *
            * Chỉ đọc những key thực sự
            * tồn tại trong file.
            */
            const rawValues =
                [
                    ...fieldsCoTrongFile
                ]
                    .map(
                        field =>
                            getValue(
                                row,
                                field
                            )
                    );


            /*
            * Bỏ dòng template:
            *
            * [[dmCoSo.id]]
            * [[dmCoSo.maCoSo]]
            * ...
            */
            if (
                rawValues.some(
                    value =>
                        this.isTemplateValue(
                            value
                        )
                )
            ) {

                continue;

            }


            /*
            * Cả dòng không có dữ liệu.
            */
            if (
                rawValues.every(
                    value =>
                        this.isBlank(
                            value
                        )
                )
            ) {

                continue;

            }


            /*
            * =====================================================
            * KHÓA
            * =====================================================
            */

            const id =
                cauHinhKhoa.hasIdKey
                    ? getOptionalNumber(
                        row,
                        "id/k",
                        "ID cơ sở"
                    )
                    : undefined;


            const maCoSo =
                cauHinhKhoa.hasMaKey
                    ? getOptionalValue(
                        row,
                        "maCoSo/k"
                    )
                    : getOptionalValue(
                        row,
                        "maCoSo"
                    );


            /*
            * =====================================================
            * FIELD NGHIỆP VỤ
            * =====================================================
            */

            const item = {

                rowNumbers: [
                    rowNumber
                ],

                fieldsCoTrongFile,

                idLaKhoa:
                    cauHinhKhoa.hasIdKey,

                maLaKhoa:
                    cauHinhKhoa.hasMaKey,

                id,

                maCoSo

            };


            const tenCoSo =
                getOptionalValue(
                    row,
                    "tenCoSo"
                );


            if (
                tenCoSo !== undefined
            ) {

                item.tenCoSo =
                    tenCoSo;

            }


            const diaChi =
                getOptionalValue(
                    row,
                    "diaChi"
                );


            if (
                diaChi !== undefined
            ) {

                item.diaChi =
                    diaChi;

            }


            const quocGiaId =
                getOptionalNumber(
                    row,
                    "quocGiaId",
                    "ID quốc gia"
                );


            if (
                quocGiaId !== undefined
            ) {

                item.quocGiaId =
                    quocGiaId;

            }


            const maQuocGia =
                getOptionalValue(
                    row,
                    "maQuocGia"
                );


            if (
                maQuocGia !== undefined
            ) {

                item.maQuocGia =
                    maQuocGia;

            }


            const tinhThanhId =
                getOptionalNumber(
                    row,
                    "tinhThanhId",
                    "ID tỉnh thành"
                );


            if (
                tinhThanhId !== undefined
            ) {

                item.tinhThanhId =
                    tinhThanhId;

            }


            const maTinhThanh =
                getOptionalValue(
                    row,
                    "maTinhThanh"
                );


            if (
                maTinhThanh !== undefined
            ) {

                item.maTinhThanh =
                    maTinhThanh;

            }


            const xaPhuongId =
                getOptionalNumber(
                    row,
                    "xaPhuongId",
                    "ID xã/phường"
                );


            if (
                xaPhuongId !== undefined
            ) {

                item.xaPhuongId =
                    xaPhuongId;

            }


            const maXaPhuong =
                getOptionalValue(
                    row,
                    "maXaPhuong"
                );


            if (
                maXaPhuong !== undefined
            ) {

                item.maXaPhuong =
                    maXaPhuong;

            }


            const active =
                getOptionalBoolean(
                    row,
                    "active"
                );


            if (
                active !== undefined
            ) {

                item.active =
                    active;

            }


            danhSach.push(
                item
            );

        }


        return {

            workbook,

            worksheet,

            danhSach

        };

    }

    async timCoSoImport(
        item
    ) {

        const coId =
            item.id !== null &&
            item.id !== undefined;


        const coMa =
            Boolean(
                item.maCoSo
            );


        /* =====================================================
           1. id/k + maCoSo/k
           ===================================================== */

        if (
            item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (
                coId &&
                coMa
            ) {

                const theoId =
                    await coSoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy cơ sở có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await coSoRepository
                        .getChiTietByMa(
                            item.maCoSo
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy cơ sở có mã "${item.maCoSo}".`
                    );

                }


                if (
                    Number(
                        theoId.id
                    ) !==
                    Number(
                        theoMa.id
                    )
                ) {

                    throw new ApiError(
                        400,
                        `ID ${item.id} và mã "${item.maCoSo}" không cùng một cơ sở.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    coSo:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            /*
             * Chỉ có ID.
             */
            if (
                coId
            ) {

                const theoId =
                    await coSoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy cơ sở có ID ${item.id}.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    coSo:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            /*
             * Chỉ mã khóa.
             */
            if (
                coMa
            ) {

                const theoMa =
                    await coSoRepository
                        .getChiTietByMa(
                            item.maCoSo
                        );


                if (
                    theoMa
                ) {

                    return {

                        hanhDong:
                            "CAP_NHAT",

                        coSo:
                            theoMa,

                        choPhepSuaMa:
                            false

                    };

                }


                return {

                    hanhDong:
                        "THEM_MOI",

                    coSo:
                        null,

                    choPhepSuaMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã cơ sở."
            );

        }


        /* =====================================================
           2. id/k + maCoSo

           Có ID:
           -> cập nhật theo ID.
           -> cho sửa mã.

           Không ID:
           -> thêm mới.
           ===================================================== */

        if (
            item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                coId
            ) {

                const theoId =
                    await coSoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy cơ sở có ID ${item.id}.`
                    );

                }


                if (
                    coMa
                ) {

                    const theoMa =
                        await coSoRepository
                            .getChiTietByMa(
                                item.maCoSo
                            );


                    if (
                        theoMa &&
                        Number(
                            theoMa.id
                        ) !==
                        Number(
                            theoId.id
                        )
                    ) {

                        throw new ApiError(
                            409,
                            `Mã cơ sở "${item.maCoSo}" đã tồn tại.`
                        );

                    }

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    coSo:
                        theoId,

                    choPhepSuaMa:
                        true

                };

            }


            /*
             * Header có id/k nhưng dòng không nhập ID.
             *
             * maCoSo không có /k
             * => luôn thêm mới.
             */
            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới cơ sở phải có mã cơ sở."
                );

            }


            const theoMa =
                await coSoRepository
                    .getChiTietByMa(
                        item.maCoSo
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã cơ sở "${item.maCoSo}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                coSo:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        /* =====================================================
           3. maCoSo/k

           Có mã:
           - tồn tại -> update
           - chưa có -> create

           Không sửa mã khi update.
           ===================================================== */

        if (
            !item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã cơ sở không được để trống."
                );

            }


            const theoMa =
                await coSoRepository
                    .getChiTietByMa(
                        item.maCoSo
                    );


            if (
                theoMa
            ) {

                return {

                    hanhDong:
                        "CAP_NHAT",

                    coSo:
                        theoMa,

                    choPhepSuaMa:
                        false

                };

            }


            return {

                hanhDong:
                    "THEM_MOI",

                coSo:
                    null,

                choPhepSuaMa:
                    false

            };

        }


        /* =====================================================
           4. maCoSo

           Không khóa.
           => luôn thêm mới.
           => trùng mã thì lỗi.
           ===================================================== */

        if (
            !item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã cơ sở không được để trống."
                );

            }


            const theoMa =
                await coSoRepository
                    .getChiTietByMa(
                        item.maCoSo
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã cơ sở "${item.maCoSo}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                coSo:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        throw new ApiError(
            400,
            "Không xác định được cách xử lý dòng import cơ sở."
        );

    }

    validateDongImport(
        item,
        isCreate
    ) {

        /*
        * =========================================================
        * ID CƠ SỞ
        * =========================================================
        */

        if (
            item.id !== undefined &&
            (
                !Number.isInteger(
                    Number(
                        item.id
                    )
                ) ||
                Number(
                    item.id
                ) <= 0
            )
        ) {

            throw new ApiError(
                400,
                "ID cơ sở phải là số nguyên lớn hơn 0."
            );

        }


        /*
        * =========================================================
        * CÁC ID LIÊN KẾT
        * =========================================================
        */

        const idFields = [

            {
                value:
                    item.quocGiaId,

                label:
                    "ID quốc gia"
            },

            {
                value:
                    item.tinhThanhId,

                label:
                    "ID tỉnh thành"
            },

            {
                value:
                    item.xaPhuongId,

                label:
                    "ID xã/phường"
            }

        ];


        for (
            const field of
            idFields
        ) {

            /*
            * Không nhập
            * => bỏ qua.
            */
            if (
                field.value ===
                undefined
            ) {

                continue;

            }


            if (
                !Number.isInteger(
                    Number(
                        field.value
                    )
                ) ||
                Number(
                    field.value
                ) <= 0
            ) {

                throw new ApiError(
                    400,
                    `${field.label} phải là số nguyên lớn hơn 0.`
                );

            }

        }


        /*
        * =========================================================
        * ACTIVE
        * =========================================================
        */

        if (
            item.active !== undefined &&
            ![
                true,
                false
            ].includes(
                item.active
            )
        ) {

            throw new ApiError(
                400,
                "Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE."
            );

        }


        /*
        * =========================================================
        * CREATE
        * =========================================================
        */

        if (
            isCreate &&
            !item.maCoSo
        ) {

            throw new ApiError(
                400,
                "Thêm mới cơ sở phải có mã cơ sở."
            );

        }

    }

    taoDuLieuNghiepVu(
        item
    ) {

        const data =
            {};


        /*
        * =========================================================
        * TÊN CƠ SỞ
        * =========================================================
        */

        if (
            item.tenCoSo !==
            undefined
        ) {

            data.tenCoSo =
                item.tenCoSo;

        }


        /*
        * =========================================================
        * ĐỊA CHỈ
        * =========================================================
        */

        if (
            item.diaChi !==
            undefined
        ) {

            data.diaChi =
                item.diaChi;

        }


        /*
        * =========================================================
        * QUỐC GIA
        * =========================================================
        */

        if (
            item.quocGiaId !==
            undefined
        ) {

            data.quocGiaId =
                item.quocGiaId;

        }


        if (
            item.maQuocGia !==
            undefined
        ) {

            data.maQuocGia =
                item.maQuocGia;

        }


        /*
        * =========================================================
        * TỈNH THÀNH
        * =========================================================
        */

        if (
            item.tinhThanhId !==
            undefined
        ) {

            data.tinhThanhId =
                item.tinhThanhId;

        }


        if (
            item.maTinhThanh !==
            undefined
        ) {

            data.maTinhThanh =
                item.maTinhThanh;

        }

        if (
            item.xaPhuongId !==
            undefined
        ) {

            data.xaPhuongId =
                item.xaPhuongId;

        }


        if (
            item.maXaPhuong !==
            undefined
        ) {

            data.maXaPhuong =
                item.maXaPhuong;

        }

        if (
            item.active !==
            undefined
        ) {

            data.active =
                item.active;

        }


        return data;

    }

    async xuLyImport(
        file
    ) {

        const {
            workbook,
            worksheet,
            danhSach
        } =
            await this.docDuLieuImport(
                file
            );


        if (
            danhSach.length === 0
        ) {

            throw new ApiError(
                400,
                "File import không có dữ liệu."
            );

        }


        const errors =
            [];

        const ketQua =
            [];


        for (
            const item of
            danhSach
        ) {

            try {


                const xuLy =
                    await this
                        .timCoSoImport(
                            item
                        );


                const isCreate =
                    xuLy.hanhDong ===
                    "THEM_MOI";


                this.validateDongImport(
                    item,
                    isCreate
                );


                /*
                * Chỉ tạo object từ những ô
                * thực sự có dữ liệu.
                */
                const dataNghiepVu =
                    this.taoDuLieuNghiepVu(
                        item
                    );

                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {
                    if (
                        xuLy.choPhepSuaMa &&
                        item.maCoSo !==
                            undefined
                    ) {

                        /*
                        * Chỉ truyền mã xuống
                        * nếu thực sự khác mã hiện tại.
                        */
                        if (
                            String(
                                item.maCoSo
                            )
                                .trim()
                                .toUpperCase() !==
                            String(
                                xuLy.coSo.maCoSo
                            )
                                .trim()
                                .toUpperCase()
                        ) {

                            dataNghiepVu.maCoSo =
                                item.maCoSo;

                        }

                    }

                    if (
                        Object.keys(
                            dataNghiepVu
                        ).length === 0
                    ) {

                        throw new ApiError(
                            400,
                            "Không có dữ liệu cần cập nhật."
                        );

                    }

                    const result =
                        await coSoService
                            .update(
                                xuLy.coSo.id,
                                dataNghiepVu
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maCoSo:
                            result.maCoSo,

                        hanhDong:
                            "CAP_NHAT",

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });


                    continue;

                }


                if (
                    item.maCoSo ===
                    undefined
                ) {

                    throw new ApiError(
                        400,
                        "Thêm mới cơ sở phải có mã cơ sở."
                    );

                }


                dataNghiepVu.maCoSo =
                    item.maCoSo;

                const result =
                    await coSoService
                        .create(
                            dataNghiepVu
                        );


                ketQua.push({

                    rowNumbers:
                        item.rowNumbers,

                    id:
                        result.id,

                    maCoSo:
                        result.maCoSo,

                    hanhDong:
                        "THEM_MOI",

                    message:
                        `Thêm mới thành công - ID ${result.id}`

                });

            } catch (error) {

                errors.push({

                    rowNumbers:
                        item.rowNumbers,

                    message:
                        error.message ||
                        "Dữ liệu không hợp lệ."

                });

            }

        }

        const result =
            await createErrorFile(
                workbook,
                worksheet,
                errors,
                `${MA_BAO_CAO}.xlsx`,
                {
                    headerRowNumber:
                        HEADER_ROW,

                    successes:
                        ketQua
                }
            );


        result.data = {

            tongSo:
                danhSach.length,

            thanhCong:
                ketQua.length,

            thatBai:
                errors.length,

            danhSach:
                ketQua

        };


        return result;

    }

    importData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const result =
                    await this
                        .xuLyImport(
                            req.file
                        );


                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(
                    error
                );

            }

        };

}

module.exports =
    new CoSoExcel();