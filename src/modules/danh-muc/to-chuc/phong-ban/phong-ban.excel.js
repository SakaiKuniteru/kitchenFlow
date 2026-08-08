const fs = require("fs");

const path = require("path");

const ExcelJS = require("exceljs");

const ApiError = require( "../../../../utils/api-error" );

const pool = require( "../../../../config/database" );

const phongBanRepository = require( "./phong-ban.repository" );

const phongBanService = require( "./phong-ban.service" );

const { readExcel } = require( "../../../../helpers/excel/excel-reader" );

const { createErrorFile } = require( "../../../../helpers/excel/excel-error" );

const { sendExcel } = require( "../../../../helpers/excel/excel-response" );

const { toNumber, toBoolean } = require( "../../../../helpers/excel/excel-value" );

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

const MA_BAO_CAO =
    "dm_phong_ban";


const FIELDS = [

    "id/k",

    "maPhongBan/k",

    "tenPhongBan",

    "moTa",

    "coSoId",

    "maCoSo",

    "active"

];


class PhongBanExcel {

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


        if (
            !row.active
        ) {

            throw new ApiError(
                400,
                `Báo cáo "${MA_BAO_CAO}" đã bị khóa.`
            );

        }


        if (
            !row.file_mau
        ) {

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
                sourceCell.protection
            ) {

                targetCell.protection =
                    this.cloneValue(
                        sourceCell.protection
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

    taoDongExport(
        item
    ) {

        return {

            id:
                item.id,

            maPhongBan:
                item.maPhongBan,

            tenPhongBan:
                item.tenPhongBan,

            moTa:
                item.moTa,

            coSoId:
                item.coSoId,

            maCoSo:
                item.coSo
                    ?.maCoSo ??
                item.coSo
                    ?.ma ??
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
                        "Không thể đọc file mẫu phòng ban."
                    );

                }


                const worksheet =
                    workbook.worksheets[0];


                if (!worksheet) {

                    throw new ApiError(
                        400,
                        "File mẫu phòng ban không có sheet dữ liệu."
                    );

                }


                const danhSach =
                    await phongBanRepository
                        .getTongHop(
                            req.query
                        );

                const templateStyleRow =
                    TEMPLATE_ROW;

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
                        templateStyleRow
                    ) {

                        this.copyRowStyle(
                            worksheet,
                            templateStyleRow,
                            rowNumber
                        );

                    }


                    const item =
                        this.taoDongExport(
                            danhSach[
                                index
                            ]
                        );


                    const row =
                        worksheet.getRow(
                            rowNumber
                        );


                    row.getCell(1).value =
                        item.id;

                    row.getCell(2).value =
                        item.maPhongBan;

                    row.getCell(3).value =
                        item.tenPhongBan;

                    row.getCell(4).value =
                        item.moTa;

                    row.getCell(5).value =
                        item.coSoId;

                    row.getCell(6).value =
                        item.maCoSo;

                    row.getCell(7).value =
                        Boolean(
                            item.active
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
                        let column = 1;
                        column <=
                            FIELDS.length;
                        column++
                    ) {

                        row.getCell(
                            column
                        ).value =
                            null;

                    }

                }

                const lastDataRow =
                    DATA_START_ROW +
                    danhSach.length -
                    1;


                if (
                    worksheet.rowCount >
                    Math.max(
                        lastDataRow,
                        DATA_START_ROW
                    )
                ) {

                    for (
                        let rowNumber =
                            Math.max(
                                lastDataRow + 1,
                                DATA_START_ROW + 1
                            );
                        rowNumber <=
                            worksheet.rowCount;
                        rowNumber++
                    ) {

                        const row =
                            worksheet.getRow(
                                rowNumber
                            );


                        for (
                            let column = 1;
                            column <=
                                FIELDS.length;
                            column++
                        ) {

                            row.getCell(
                                column
                            ).value =
                                null;

                        }

                    }

                }


                const buffer =
                    await workbook.xlsx
                        .writeBuffer();


                return sendExcel(
                    res,
                    {
                        fileName:
                            `${baoCao.maBaoCao}.xlsx`,

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
                "maPhongBan/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maPhongBan"
            );

        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maPhongBan hoặc maPhongBan/k."
            );

        }

        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maPhongBan và maPhongBan/k."
            );

        }


        const requiredFields = [

            "tenPhongBan",

            "moTa",

            "coSoId",

            "maCoSo",

            "active"

        ];


        for (
            const field of
            requiredFields
        ) {

            if (
                !headerMap.has(
                    field
                )
            ) {

                throw new ApiError(
                    400,
                    `File import thiếu field: ${field}.`
                );

            }

        }


        return {

            hasIdKey,

            hasMaKey,

            hasMaNormal

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


        const danhSach =
            [];


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


            const idRaw =
                cauHinhKhoa.hasIdKey
                    ? getValue(
                        row,
                        "id/k"
                    )
                    : null;


            const maPhongBanRaw =
                cauHinhKhoa.hasMaKey
                    ? getValue(
                        row,
                        "maPhongBan/k"
                    )
                    : getValue(
                        row,
                        "maPhongBan"
                    );


            const tenPhongBanRaw =
                getValue(
                    row,
                    "tenPhongBan"
                );


            const moTaRaw =
                getValue(
                    row,
                    "moTa"
                );


            const coSoIdRaw =
                getValue(
                    row,
                    "coSoId"
                );


            const maCoSoRaw =
                getValue(
                    row,
                    "maCoSo"
                );


            const activeRaw =
                getValue(
                    row,
                    "active"
                );


            if (
                [
                    idRaw,
                    maPhongBanRaw,
                    tenPhongBanRaw,
                    moTaRaw,
                    coSoIdRaw,
                    maCoSoRaw,
                    activeRaw
                ].some(
                    value =>
                        this.isTemplateValue(
                            value
                        )
                )
            ) {

                continue;

            }


            const isEmptyRow =
                [
                    idRaw,
                    maPhongBanRaw,
                    tenPhongBanRaw,
                    moTaRaw,
                    coSoIdRaw,
                    maCoSoRaw,
                    activeRaw
                ].every(
                    value =>
                        this.isBlank(
                            value
                        )
                );


            if (
                isEmptyRow
            ) {

                continue;

            }


            let active =
                true;


            if (
                !this.isBlank(
                    activeRaw
                )
            ) {

                try {

                    active =
                        toBoolean(
                            activeRaw,
                            true
                        );

                } catch (error) {

                    active =
                        activeRaw;

                }

            }


            danhSach.push({

                rowNumbers: [
                    rowNumber
                ],

                idLaKhoa:
                    cauHinhKhoa.hasIdKey,

                maLaKhoa:
                    cauHinhKhoa.hasMaKey,


                id:
                    this.isBlank(
                        idRaw
                    )
                        ? null
                        : toNumber(
                            idRaw
                        ),

                maPhongBan:
                    this.isBlank(
                        maPhongBanRaw
                    )
                        ? null
                        : String(
                            maPhongBanRaw
                        ).trim(),

                tenPhongBan:
                    this.isBlank(
                        tenPhongBanRaw
                    )
                        ? null
                        : String(
                            tenPhongBanRaw
                        ).trim(),

                moTa:
                    this.isBlank(
                        moTaRaw
                    )
                        ? null
                        : String(
                            moTaRaw
                        ).trim(),

                coSoId:
                    this.isBlank(
                        coSoIdRaw
                    )
                        ? null
                        : toNumber(
                            coSoIdRaw
                        ),

                maCoSo:
                    this.isBlank(
                        maCoSoRaw
                    )
                        ? null
                        : String(
                            maCoSoRaw
                        ).trim(),

                active

            });

        }


        return {

            workbook,

            worksheet,

            danhSach

        };

    }

    async timPhongBanImport(
        item
    ) {

        const coId =
            item.id !== null &&
            item.id !== undefined;


        const coMa =
            Boolean(
                item.maPhongBan
            );

        if (
            item.idLaKhoa &&
            item.maLaKhoa
        ) {
            if (
                coId &&
                coMa
            ) {

                const theoId =
                    await phongBanRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy phòng ban có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await phongBanRepository
                        .getChiTietByMa(
                            item.maPhongBan
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy phòng ban có mã "${item.maPhongBan}".`
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
                        `ID ${item.id} và mã "${item.maPhongBan}" không cùng một phòng ban.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    phongBan:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }

            if (
                coId
            ) {

                const theoId =
                    await phongBanRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy phòng ban có ID ${item.id}.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    phongBan:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            if (
                coMa
            ) {

                const theoMa =
                    await phongBanRepository
                        .getChiTietByMa(
                            item.maPhongBan
                        );


                if (
                    theoMa
                ) {

                    return {

                        hanhDong:
                            "CAP_NHAT",

                        phongBan:
                            theoMa,

                        choPhepSuaMa:
                            false

                    };

                }


                return {

                    hanhDong:
                        "THEM_MOI",

                    phongBan:
                        null,

                    choPhepSuaMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã phòng ban."
            );

        }

        if (
            item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                !coId
            ) {

                throw new ApiError(
                    400,
                    "Phải nhập ID phòng ban để cập nhật."
                );

            }


            const theoId =
                await phongBanRepository
                    .getChiTiet(
                        Number(
                            item.id
                        )
                    );


            if (!theoId) {

                throw new ApiError(
                    404,
                    `Không tìm thấy phòng ban có ID ${item.id}.`
                );

            }

            if (
                coMa
            ) {

                const theoMa =
                    await phongBanRepository
                        .getChiTietByMa(
                            item.maPhongBan
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
                        `Mã phòng ban "${item.maPhongBan}" đã tồn tại.`
                    );

                }

            }


            return {

                hanhDong:
                    "CAP_NHAT",

                phongBan:
                    theoId,

                choPhepSuaMa:
                    true

            };

        }

        if (
            !item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã phòng ban không được để trống."
                );

            }


            const theoMa =
                await phongBanRepository
                    .getChiTietByMa(
                        item.maPhongBan
                    );


            if (
                theoMa
            ) {

                return {

                    hanhDong:
                        "CAP_NHAT",

                    phongBan:
                        theoMa,

                    choPhepSuaMa:
                        false

                };

            }


            return {

                hanhDong:
                    "THEM_MOI",

                phongBan:
                    null,

                choPhepSuaMa:
                    false

            };

        }

        if (
            !item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã phòng ban không được để trống."
                );

            }


            const theoMa =
                await phongBanRepository
                    .getChiTietByMa(
                        item.maPhongBan
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã phòng ban "${item.maPhongBan}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                phongBan:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        throw new ApiError(
            400,
            "Không xác định được cách xử lý dòng import."
        );

    }

    async chuanHoaCoSoImport(
        item
    ) {

        const coCoSoId =
            item.coSoId !== null &&
            item.coSoId !== undefined;


        const coMaCoSo =
            Boolean(
                item.maCoSo
            );


        if (
            !coCoSoId &&
            !coMaCoSo
        ) {

            throw new ApiError(
                400,
                "Phải truyền coSoId hoặc maCoSo."
            );

        }


        /*
         * Nếu có mã cơ sở,
         * tìm ID từ mã.
         */
        if (
            coMaCoSo
        ) {

            const coSo =
                await phongBanRepository
                    .getCoSoByMa(
                        item.maCoSo
                    );


            if (!coSo) {

                throw new ApiError(
                    400,
                    `Mã cơ sở "${item.maCoSo}" không tồn tại.`
                );

            }


            if (!coSo.active) {

                throw new ApiError(
                    400,
                    `Cơ sở "${item.maCoSo}" đã bị khóa.`
                );

            }


            /*
             * Có cả ID + mã cơ sở:
             * phải khớp.
             */
            if (
                coCoSoId &&
                Number(
                    item.coSoId
                ) !==
                Number(
                    coSo.id
                )
            ) {

                throw new ApiError(
                    400,
                    `coSoId ${item.coSoId} và maCoSo "${item.maCoSo}" không khớp.`
                );

            }


            /*
             * Chuyển hết về ID.
             *
             * Việc này tránh lỗi update hiện tại của
             * PhongBanService khi maCoSo mới đi cùng coSoId cũ.
             */
            return Number(
                coSo.id
            );

        }


        const tonTai =
            await phongBanRepository
                .existsCoSo(
                    Number(
                        item.coSoId
                    )
                );


        if (!tonTai) {

            throw new ApiError(
                400,
                `Cơ sở có ID ${item.coSoId} không tồn tại hoặc đã bị khóa.`
            );

        }


        return Number(
            item.coSoId
        );

    }

    validateDongImport(
        item,
        isCreate
    ) {

        if (
            isCreate &&
            !item.maPhongBan
        ) {

            throw new ApiError(
                400,
                "Thêm mới phòng ban phải có mã phòng ban."
            );

        }


        if (
            !item.tenPhongBan
        ) {

            throw new ApiError(
                400,
                "Tên phòng ban không được để trống."
            );

        }


        if (
            item.id !== null &&
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
                "ID phòng ban phải là số nguyên lớn hơn 0."
            );

        }


        if (
            item.coSoId !== null &&
            item.coSoId !== undefined &&
            (
                !Number.isInteger(
                    Number(
                        item.coSoId
                    )
                ) ||
                Number(
                    item.coSoId
                ) <= 0
            )
        ) {

            throw new ApiError(
                400,
                "ID cơ sở phải là số nguyên lớn hơn 0."
            );

        }


        if (
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

    }

    async xuLyImport(
        file
    ) {

        const {
            workbook,
            worksheet,
            danhSach
        } =
            await this
                .docDuLieuImport(
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
                    await this.timPhongBanImport(
                        item
                    );


                const isCreate =
                    xuLy.hanhDong ===
                    "THEM_MOI";


                this.validateDongImport(
                    item,
                    isCreate
                );


                const coSoId =
                    await this.chuanHoaCoSoImport(
                        item
                    );


                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {

                    const dataUpdate = {

                        tenPhongBan:
                            item.tenPhongBan,

                        moTa:
                            item.moTa,

                        coSoId,

                        active:
                            item.active

                    };

                    if (
                        xuLy.choPhepSuaMa
                    ) {

                        dataUpdate.maPhongBan =
                            item.maPhongBan;

                    }


                    const result =
                        await phongBanService
                            .update(
                                xuLy.phongBan.id,
                                dataUpdate
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maPhongBan:
                            result.maPhongBan,

                        hanhDong:
                            "CAP_NHAT",

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });

                } else {

                    const dataCreate = {

                        maPhongBan:
                            item.maPhongBan,

                        tenPhongBan:
                            item.tenPhongBan,

                        moTa:
                            item.moTa,

                        coSoId,

                        active:
                            item.active

                    };


                    const result =
                        await phongBanService
                            .create(
                                dataCreate
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maPhongBan:
                            result.maPhongBan,

                        hanhDong:
                            "THEM_MOI",

                        message:
                            `Thêm mới thành công - ID ${result.id}`

                    });

                }

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

        if (
            errors.length > 0
        ) {

            const result =
                await createErrorFile(
                    workbook,
                    worksheet,
                    errors,
                    `dm_phong_ban_import_${Date.now()}.xlsx`,
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


        return {

            coLoi:
                false,

            data: {

                tongSo:
                    danhSach.length,

                thanhCong:
                    ketQua.length,

                thatBai:
                    0,

                danhSach:
                    ketQua

            }

        };

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


                if (
                    result.coLoi
                ) {

                    return sendExcel(
                        res,
                        result
                    );

                }


                return res
                    .status(
                        200
                    )
                    .json({

                        success:
                            true,

                        message:
                            "Import phòng ban thành công.",

                        data:
                            result.data

                    });

            } catch (error) {

                next(
                    error
                );

            }

        };

}


module.exports =
    new PhongBanExcel();