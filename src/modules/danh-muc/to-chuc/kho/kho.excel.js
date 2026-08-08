const fs =
    require("fs");

const path =
    require("path");

const ExcelJS =
    require("exceljs");

const ApiError =
    require(
        "../../../../utils/api-error"
    );

const pool =
    require(
        "../../../../config/database"
    );

const khoRepository =
    require(
        "./kho.repository"
    );

const khoService =
    require(
        "./kho.service"
    );

const {
    readExcel
} =
    require(
        "../../../../helpers/excel/excel-reader"
    );

const {
    createErrorFile
} =
    require(
        "../../../../helpers/excel/excel-error"
    );

const {
    sendExcel
} =
    require(
        "../../../../helpers/excel/excel-response"
    );

const {
    toNumber,
    toBoolean
} =
    require(
        "../../../../helpers/excel/excel-value"
    );


const HEADER_ROW =
    3;

const TEMPLATE_ROW =
    5;

const DATA_START_ROW =
    5;

const MA_BAO_CAO =
    "dm_kho";


const FIELDS = [

    "id/k",

    "maKho/k",

    "tenKho",

    "nhaAnId",

    "maNhaAn",

    "loaiKho",

    "diaDiem",

    "nhietDoToiThieu",

    "nhietDoToiDa",

    "moTa",

    "active"

];


class KhoExcel {


    /* =========================================================
       FILE MẪU
       ========================================================= */

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


    /* =========================================================
       HELPER
       ========================================================= */

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


    /* =========================================================
       EXPORT
       ========================================================= */

    taoDongExport(
        item
    ) {

        return {

            id:
                item.id,

            maKho:
                item.maKho,

            tenKho:
                item.tenKho,

            nhaAnId:
                item.nhaAnId,

            maNhaAn:
                item.nhaAn?.ma ??
                null,

            loaiKho:
                item.loaiKho,

            diaDiem:
                item.diaDiem,

            nhietDoToiThieu:
                item.nhietDoToiThieu,

            nhietDoToiDa:
                item.nhietDoToiDa,

            moTa:
                item.moTa,

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
                        "Không thể đọc file mẫu kho."
                    );

                }


                const worksheet =
                    workbook.worksheets[0];


                if (!worksheet) {

                    throw new ApiError(
                        400,
                        "File mẫu kho không có sheet dữ liệu."
                    );

                }


                const danhSach =
                    await khoRepository
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
                        item.maKho;

                    row.getCell(3).value =
                        item.tenKho;

                    row.getCell(4).value =
                        item.nhaAnId;

                    row.getCell(5).value =
                        item.maNhaAn;

                    row.getCell(6).value =
                        item.loaiKho;

                    row.getCell(7).value =
                        item.diaDiem;

                    row.getCell(8).value =
                        item.nhietDoToiThieu;

                    row.getCell(9).value =
                        item.nhietDoToiDa;

                    row.getCell(10).value =
                        item.moTa;

                    row.getCell(11).value =
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


    /* =========================================================
       HEADER
       ========================================================= */

    validateHeaders(
        headerMap
    ) {

        const hasIdKey =
            headerMap.has(
                "id/k"
            );


        const hasMaKey =
            headerMap.has(
                "maKho/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maKho"
            );


        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maKho hoặc maKho/k."
            );

        }


        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maKho và maKho/k."
            );

        }


        const requiredFields = [

            "tenKho",

            "nhaAnId",

            "maNhaAn",

            "loaiKho",

            "diaDiem",

            "nhietDoToiThieu",

            "nhietDoToiDa",

            "moTa",

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


    /* =========================================================
       ĐỌC DỮ LIỆU IMPORT
       ========================================================= */

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


            const maKhoRaw =
                cauHinhKhoa.hasMaKey
                    ? getValue(
                        row,
                        "maKho/k"
                    )
                    : getValue(
                        row,
                        "maKho"
                    );


            const tenKhoRaw =
                getValue(
                    row,
                    "tenKho"
                );


            const nhaAnIdRaw =
                getValue(
                    row,
                    "nhaAnId"
                );


            const maNhaAnRaw =
                getValue(
                    row,
                    "maNhaAn"
                );


            const loaiKhoRaw =
                getValue(
                    row,
                    "loaiKho"
                );


            const diaDiemRaw =
                getValue(
                    row,
                    "diaDiem"
                );


            const nhietDoToiThieuRaw =
                getValue(
                    row,
                    "nhietDoToiThieu"
                );


            const nhietDoToiDaRaw =
                getValue(
                    row,
                    "nhietDoToiDa"
                );


            const moTaRaw =
                getValue(
                    row,
                    "moTa"
                );


            const activeRaw =
                getValue(
                    row,
                    "active"
                );


            const rawValues = [

                idRaw,

                maKhoRaw,

                tenKhoRaw,

                nhaAnIdRaw,

                maNhaAnRaw,

                loaiKhoRaw,

                diaDiemRaw,

                nhietDoToiThieuRaw,

                nhietDoToiDaRaw,

                moTaRaw,

                activeRaw

            ];


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

                maKho:
                    this.isBlank(
                        maKhoRaw
                    )
                        ? null
                        : String(
                            maKhoRaw
                        ).trim(),

                tenKho:
                    this.isBlank(
                        tenKhoRaw
                    )
                        ? null
                        : String(
                            tenKhoRaw
                        ).trim(),

                nhaAnId:
                    this.isBlank(
                        nhaAnIdRaw
                    )
                        ? null
                        : toNumber(
                            nhaAnIdRaw
                        ),

                maNhaAn:
                    this.isBlank(
                        maNhaAnRaw
                    )
                        ? null
                        : String(
                            maNhaAnRaw
                        ).trim(),

                loaiKho:
                    this.isBlank(
                        loaiKhoRaw
                    )
                        ? null
                        : toNumber(
                            loaiKhoRaw
                        ),

                diaDiem:
                    this.isBlank(
                        diaDiemRaw
                    )
                        ? null
                        : String(
                            diaDiemRaw
                        ).trim(),

                nhietDoToiThieu:
                    this.isBlank(
                        nhietDoToiThieuRaw
                    )
                        ? null
                        : toNumber(
                            nhietDoToiThieuRaw
                        ),

                nhietDoToiDa:
                    this.isBlank(
                        nhietDoToiDaRaw
                    )
                        ? null
                        : toNumber(
                            nhietDoToiDaRaw
                        ),

                moTa:
                    this.isBlank(
                        moTaRaw
                    )
                        ? null
                        : String(
                            moTaRaw
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


    /* =========================================================
       TÌM KHO IMPORT
       ========================================================= */

    async timKhoImport(
        item
    ) {

        const coId =
            item.id !== null &&
            item.id !== undefined;


        const coMa =
            Boolean(
                item.maKho
            );


        /* =====================================================
           1. id/k + maKho/k
           ===================================================== */

        if (
            item.idLaKhoa &&
            item.maLaKhoa
        ) {

            /*
             * Có cả ID + mã.
             */
            if (
                coId &&
                coMa
            ) {

                const theoId =
                    await khoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy kho có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await khoRepository
                        .getChiTietByMa(
                            item.maKho
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy kho có mã "${item.maKho}".`
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
                        `ID ${item.id} và mã "${item.maKho}" không cùng một kho.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    kho:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            /*
             * Chỉ ID.
             */
            if (
                coId
            ) {

                const theoId =
                    await khoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy kho có ID ${item.id}.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    kho:
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
                    await khoRepository
                        .getChiTietByMa(
                            item.maKho
                        );


                if (
                    theoMa
                ) {

                    return {

                        hanhDong:
                            "CAP_NHAT",

                        kho:
                            theoMa,

                        choPhepSuaMa:
                            false

                    };

                }


                return {

                    hanhDong:
                        "THEM_MOI",

                    kho:
                        null,

                    choPhepSuaMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã kho."
            );

        }


        /* =====================================================
           2. id/k + maKho

           Có ID:
           -> update theo ID
           -> được sửa mã

           ID trống:
           -> create
           ===================================================== */

        if (
            item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            /*
             * Có ID.
             */
            if (
                coId
            ) {

                const theoId =
                    await khoRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy kho có ID ${item.id}.`
                    );

                }


                if (
                    coMa
                ) {

                    const theoMa =
                        await khoRepository
                            .getChiTietByMa(
                                item.maKho
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
                            `Mã kho "${item.maKho}" đã tồn tại.`
                        );

                    }

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    kho:
                        theoId,

                    choPhepSuaMa:
                        true

                };

            }


            /*
             * Có header id/k nhưng dòng không nhập ID.
             * maKho không có /k => CREATE.
             */
            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới kho phải có mã kho."
                );

            }


            const theoMa =
                await khoRepository
                    .getChiTietByMa(
                        item.maKho
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã kho "${item.maKho}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                kho:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        /* =====================================================
           3. maKho/k

           Có -> update
           Chưa có -> create
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
                    "Mã kho không được để trống."
                );

            }


            const theoMa =
                await khoRepository
                    .getChiTietByMa(
                        item.maKho
                    );


            if (
                theoMa
            ) {

                return {

                    hanhDong:
                        "CAP_NHAT",

                    kho:
                        theoMa,

                    choPhepSuaMa:
                        false

                };

            }


            return {

                hanhDong:
                    "THEM_MOI",

                kho:
                    null,

                choPhepSuaMa:
                    false

            };

        }


        /* =====================================================
           4. maKho

           Không có khóa.
           -> luôn create
           -> trùng mã thì lỗi.
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
                    "Mã kho không được để trống."
                );

            }


            const theoMa =
                await khoRepository
                    .getChiTietByMa(
                        item.maKho
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã kho "${item.maKho}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                kho:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        throw new ApiError(
            400,
            "Không xác định được cách xử lý dòng import kho."
        );

    }


    /* =========================================================
       VALIDATE DÒNG
       ========================================================= */

    validateDongImport(
        item,
        isCreate
    ) {

        if (
            isCreate &&
            !item.maKho
        ) {

            throw new ApiError(
                400,
                "Thêm mới kho phải có mã kho."
            );

        }


        if (
            !item.tenKho
        ) {

            throw new ApiError(
                400,
                "Tên kho không được để trống."
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
                "ID kho phải là số nguyên lớn hơn 0."
            );

        }


        if (
            item.nhaAnId !== null &&
            item.nhaAnId !== undefined &&
            (
                !Number.isInteger(
                    Number(
                        item.nhaAnId
                    )
                ) ||
                Number(
                    item.nhaAnId
                ) <= 0
            )
        ) {

            throw new ApiError(
                400,
                "ID nhà ăn phải là số nguyên lớn hơn 0."
            );

        }


        if (
            item.loaiKho === null ||
            item.loaiKho === undefined
        ) {

            throw new ApiError(
                400,
                "Loại kho không được để trống."
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


    /* =========================================================
       DATA NGHIỆP VỤ
       ========================================================= */

    taoDuLieuNghiepVu(
        item
    ) {

        const data = {

            tenKho:
                item.tenKho,

            loaiKho:
                item.loaiKho,

            diaDiem:
                item.diaDiem,

            nhietDoToiThieu:
                item.nhietDoToiThieu,

            nhietDoToiDa:
                item.nhietDoToiDa,

            moTa:
                item.moTa,

            active:
                item.active

        };


        if (
            item.nhaAnId !== null &&
            item.nhaAnId !== undefined
        ) {

            data.nhaAnId =
                item.nhaAnId;

        }


        if (
            item.maNhaAn
        ) {

            data.maNhaAn =
                item.maNhaAn;

        }


        return data;

    }


    /* =========================================================
       IMPORT
       ========================================================= */

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
                        .timKhoImport(
                            item
                        );


                const isCreate =
                    xuLy.hanhDong ===
                    "THEM_MOI";


                this.validateDongImport(
                    item,
                    isCreate
                );


                const dataNghiepVu =
                    this.taoDuLieuNghiepVu(
                        item
                    );


                /*
                 * UPDATE
                 */
                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {

                    if (
                        xuLy.choPhepSuaMa
                    ) {

                        dataNghiepVu.maKho =
                            item.maKho;

                    }


                    const result =
                        await khoService
                            .update(
                                xuLy.kho.id,
                                dataNghiepVu
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maKho:
                            result.maKho,

                        hanhDong:
                            "CAP_NHAT",

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });


                    continue;

                }


                /*
                 * CREATE
                 */

                dataNghiepVu.maKho =
                    item.maKho;


                const result =
                    await khoService
                        .create(
                            dataNghiepVu
                        );


                ketQua.push({

                    rowNumbers:
                        item.rowNumbers,

                    id:
                        result.id,

                    maKho:
                        result.maKho,

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
    new KhoExcel();