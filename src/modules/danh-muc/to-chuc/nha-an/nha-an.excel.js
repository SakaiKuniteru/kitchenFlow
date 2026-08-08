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

const nhaAnRepository =
    require(
        "./nha-an.repository"
    );

const nhaAnService =
    require(
        "./nha-an.service"
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
    "dm_nha_an";


const FIELDS = [

    "id/k",

    "maNhaAn/k",

    "tenNhaAn",

    "coSoId",

    "maCoSo",

    "dsNvQuanLyId",

    "dsMaNvQuanLy",

    "active"

];


class NhaAnExcel {

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


    /*
     * Excel nhập danh sách:
     *
     * 1,2,3
     * hoặc
     * NV001,NV002,NV003
     */
    parseList(
        value
    ) {

        if (
            this.isBlank(
                value
            )
        ) {

            return undefined;

        }


        return String(
            value
        )
            .split(
                /[,;\n]+/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                Boolean
            );

    }


    parseIdList(
        value
    ) {

        const danhSach =
            this.parseList(
                value
            );


        if (
            danhSach === undefined
        ) {

            return undefined;

        }


        return danhSach.map(
            item => {

                const id =
                    Number(
                        item
                    );


                if (
                    !Number.isInteger(
                        id
                    ) ||
                    id <= 0
                ) {

                    throw new ApiError(
                        400,
                        `ID nhân viên quản lý "${item}" không hợp lệ.`
                    );

                }


                return id;

            }
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


    /* =========================================================
       EXPORT
       ========================================================= */

    taoDongExport(
        item
    ) {

        return {

            id:
                item.id,

            maNhaAn:
                item.maNhaAn,

            tenNhaAn:
                item.tenNhaAn,

            coSoId:
                item.coSoId,

            maCoSo:
                item.coSo?.ma ??
                null,

            dsNvQuanLyId:
                Array.isArray(
                    item.dsNvQuanLyId
                )
                    ? item.dsNvQuanLyId
                        .join(",")
                    : "",

            dsMaNvQuanLy:
                Array.isArray(
                    item.dsNvQuanLy
                )
                    ? item.dsNvQuanLy
                        .map(
                            nv =>
                                nv.maNhanVien
                        )
                        .filter(
                            Boolean
                        )
                        .join(",")
                    : "",

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
                        "Không thể đọc file mẫu nhà ăn."
                    );

                }


                const worksheet =
                    workbook.worksheets[0];


                if (!worksheet) {

                    throw new ApiError(
                        400,
                        "File mẫu nhà ăn không có sheet dữ liệu."
                    );

                }


                const danhSach =
                    await nhaAnRepository
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
                        item.maNhaAn;

                    row.getCell(3).value =
                        item.tenNhaAn;

                    row.getCell(4).value =
                        item.coSoId;

                    row.getCell(5).value =
                        item.maCoSo;

                    row.getCell(6).value =
                        item.dsNvQuanLyId;

                    row.getCell(7).value =
                        item.dsMaNvQuanLy;

                    row.getCell(8).value =
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
                "maNhaAn/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maNhaAn"
            );


        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maNhaAn hoặc maNhaAn/k."
            );

        }


        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maNhaAn và maNhaAn/k."
            );

        }


        const requiredFields = [

            "tenNhaAn",

            "coSoId",

            "maCoSo",

            "dsNvQuanLyId",

            "dsMaNvQuanLy",

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
       READ
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


            const maNhaAnRaw =
                cauHinhKhoa.hasMaKey
                    ? getValue(
                        row,
                        "maNhaAn/k"
                    )
                    : getValue(
                        row,
                        "maNhaAn"
                    );


            const tenNhaAnRaw =
                getValue(
                    row,
                    "tenNhaAn"
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


            const dsNvQuanLyIdRaw =
                getValue(
                    row,
                    "dsNvQuanLyId"
                );


            const dsMaNvQuanLyRaw =
                getValue(
                    row,
                    "dsMaNvQuanLy"
                );


            const activeRaw =
                getValue(
                    row,
                    "active"
                );


            const rawValues = [

                idRaw,

                maNhaAnRaw,

                tenNhaAnRaw,

                coSoIdRaw,

                maCoSoRaw,

                dsNvQuanLyIdRaw,

                dsMaNvQuanLyRaw,

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


            let dsNvQuanLyId =
                undefined;


            try {

                dsNvQuanLyId =
                    this.parseIdList(
                        dsNvQuanLyIdRaw
                    );

            } catch (error) {

                /*
                 * Giữ lại lỗi theo từng dòng.
                 */
                dsNvQuanLyId = {
                    loi:
                        error.message
                };

            }


            const dsMaNvQuanLy =
                this.parseList(
                    dsMaNvQuanLyRaw
                );


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

                maNhaAn:
                    this.isBlank(
                        maNhaAnRaw
                    )
                        ? null
                        : String(
                            maNhaAnRaw
                        ).trim(),

                tenNhaAn:
                    this.isBlank(
                        tenNhaAnRaw
                    )
                        ? null
                        : String(
                            tenNhaAnRaw
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

                dsNvQuanLyId,

                dsMaNvQuanLy,

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
       XÁC ĐỊNH CREATE / UPDATE
       ========================================================= */

    async timNhaAnImport(
        item
    ) {

        const coId =
            item.id !== null &&
            item.id !== undefined;


        const coMa =
            Boolean(
                item.maNhaAn
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
                    await nhaAnRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy nhà ăn có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await nhaAnRepository
                        .getChiTietByMa(
                            item.maNhaAn
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy nhà ăn có mã "${item.maNhaAn}".`
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
                        `ID ${item.id} và mã "${item.maNhaAn}" không cùng một nhà ăn.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    nhaAn:
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
                    await nhaAnRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy nhà ăn có ID ${item.id}.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    nhaAn:
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
                    await nhaAnRepository
                        .getChiTietByMa(
                            item.maNhaAn
                        );


                if (
                    theoMa
                ) {

                    return {

                        hanhDong:
                            "CAP_NHAT",

                        nhaAn:
                            theoMa,

                        choPhepSuaMa:
                            false

                    };

                }


                return {

                    hanhDong:
                        "THEM_MOI",

                    nhaAn:
                        null,

                    choPhepSuaMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã nhà ăn."
            );

        }

        if (
            item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                coId
            ) {

                const theoId =
                    await nhaAnRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy nhà ăn có ID ${item.id}.`
                    );

                }

                if (
                    coMa
                ) {

                    const theoMa =
                        await nhaAnRepository
                            .getChiTietByMa(
                                item.maNhaAn
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
                            `Mã nhà ăn "${item.maNhaAn}" đã tồn tại.`
                        );

                    }

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    nhaAn:
                        theoId,

                    choPhepSuaMa:
                        true

                };

            }

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới nhà ăn phải có mã nhà ăn."
                );

            }

            const theoMa =
                await nhaAnRepository
                    .getChiTietByMa(
                        item.maNhaAn
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã nhà ăn "${item.maNhaAn}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                nhaAn:
                    null,

                choPhepSuaMa:
                    true

            };

        }

        if (
            !item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (!coMa) {

                throw new ApiError(
                    400,
                    "Mã nhà ăn không được để trống."
                );

            }


            const theoMa =
                await nhaAnRepository
                    .getChiTietByMa(
                        item.maNhaAn
                    );


            if (
                theoMa
            ) {

                return {

                    hanhDong:
                        "CAP_NHAT",

                    nhaAn:
                        theoMa,

                    choPhepSuaMa:
                        false

                };

            }


            return {

                hanhDong:
                    "THEM_MOI",

                nhaAn:
                    null,

                choPhepSuaMa:
                    false

            };

        }

        if (
            !item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (!coMa) {

                throw new ApiError(
                    400,
                    "Mã nhà ăn không được để trống."
                );

            }


            const theoMa =
                await nhaAnRepository
                    .getChiTietByMa(
                        item.maNhaAn
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã nhà ăn "${item.maNhaAn}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                nhaAn:
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

    validateDongImport(
        item,
        isCreate
    ) {

        if (
            isCreate &&
            !item.maNhaAn
        ) {

            throw new ApiError(
                400,
                "Thêm mới nhà ăn phải có mã nhà ăn."
            );

        }


        if (
            !item.tenNhaAn
        ) {

            throw new ApiError(
                400,
                "Tên nhà ăn không được để trống."
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
                "ID nhà ăn phải là số nguyên lớn hơn 0."
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
            item.dsNvQuanLyId &&
            !Array.isArray(
                item.dsNvQuanLyId
            )
        ) {

            throw new ApiError(
                400,
                item.dsNvQuanLyId.loi ||
                "Danh sách ID nhân viên quản lý không hợp lệ."
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

    taoDuLieuNghiepVu(
        item
    ) {

        const data = {

            tenNhaAn:
                item.tenNhaAn,

            active:
                item.active

        };

        if (
            item.coSoId !== null &&
            item.coSoId !== undefined
        ) {

            data.coSoId =
                item.coSoId;

        }


        if (
            item.maCoSo
        ) {

            data.maCoSo =
                item.maCoSo;

        }

        if (
            item.dsNvQuanLyId !==
            undefined
        ) {

            data.dsNvQuanLyId =
                item.dsNvQuanLyId;

        }


        if (
            item.dsMaNvQuanLy !==
            undefined
        ) {

            data.dsMaNvQuanLy =
                item.dsMaNvQuanLy;

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
                    await this.timNhaAnImport(
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


                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {

                    if (
                        xuLy.choPhepSuaMa
                    ) {

                        dataNghiepVu.maNhaAn =
                            item.maNhaAn;

                    }


                    const result =
                        await nhaAnService
                            .update(
                                xuLy.nhaAn.id,
                                dataNghiepVu
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maNhaAn:
                            result.maNhaAn,

                        hanhDong:
                            "CAP_NHAT",

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });


                    continue;

                }


                dataNghiepVu.maNhaAn =
                    item.maNhaAn;


                const result =
                    await nhaAnService
                        .create(
                            dataNghiepVu
                        );


                ketQua.push({

                    rowNumbers:
                        item.rowNumbers,

                    id:
                        result.id,

                    maNhaAn:
                        result.maNhaAn,

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
                `dm_nha_an.xlsx`,
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


                /*
                * Import luôn trả file Excel kết quả,
                * bất kể có lỗi hay không.
                */
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
    new NhaAnExcel();