const fs = require("fs");

const path = require("path");

const ExcelJS = require("exceljs");

const ApiError = require("../../../../utils/api-error");

const pool = require("../../../../config/database");

const chucVuRepository = require("./chuc-vu.repository");

const chucVuService = require("./chuc-vu.service");

const { readExcel } = require("../../../../helpers/excel/excel-reader");

const { createErrorFile } = require("../../../../helpers/excel/excel-error");

const { sendExcel } = require("../../../../helpers/excel/excel-response");

const { toNumber, toBoolean } = require("../../../../helpers/excel/excel-value");

const { isBlank, copyRowStyle, getExportHeaderMap, ghiDongExport, getOptionalValue, rowHasData } = require("../../../../helpers/excel/excel-template");

const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;

const MA_BAO_CAO = "dm_chuc_vu";

class ChucVuExcel {


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


    taoDongExport(
        item
    ) {

        return {

            id:
                item.id,

            maChucVu:
                item.maChucVu,

            tenChucVu:
                item.tenChucVu,

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
                        "Không thể đọc file mẫu chức vụ."
                    );

                }


                const worksheet =
                    workbook.worksheets[0];


                if (!worksheet) {

                    throw new ApiError(
                        400,
                        "File mẫu chức vụ không có sheet dữ liệu."
                    );

                }


                /*
                 * Export đọc theo KEY,
                 * không theo thứ tự cột.
                 */
                const headerMap =
                    getExportHeaderMap(
                        worksheet,
                        HEADER_ROW
                    );


                const danhSach =
                    await chucVuRepository
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

                        copyRowStyle(
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


                    ghiDongExport(
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
                "maChucVu/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maChucVu"
            );


        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maChucVu hoặc maChucVu/k."
            );

        }


        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maChucVu và maChucVu/k."
            );

        }


        return {

            hasIdKey,

            hasMaKey,

            hasMaNormal,

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
             * Không có dữ liệu hoặc là dòng template
             * => bỏ qua.
             */
            if (
                !rowHasData(
                    row,
                    getValue,
                    fieldsCoTrongFile
                )
            ) {

                continue;

            }


            const idRaw =
                cauHinhKhoa.hasIdKey
                    ? getOptionalValue(
                        row,
                        getValue,
                        fieldsCoTrongFile,
                        "id/k"
                    )
                    : undefined;


            let id =
                undefined;


            if (
                idRaw !==
                undefined
            ) {

                id =
                    toNumber(
                        idRaw
                    );


                if (
                    id === null
                ) {

                    throw new ApiError(
                        400,
                        `Dòng ${rowNumber}: ID chức vụ không hợp lệ.`
                    );

                }

            }


            const fieldMa =
                cauHinhKhoa.hasMaKey
                    ? "maChucVu/k"
                    : "maChucVu";


            const maChucVu =
                getOptionalValue(
                    row,
                    getValue,
                    fieldsCoTrongFile,
                    fieldMa
                );


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

                maChucVu

            };


            const tenChucVu =
                getOptionalValue(
                    row,
                    getValue,
                    fieldsCoTrongFile,
                    "tenChucVu"
                );


            if (
                tenChucVu !==
                undefined
            ) {

                item.tenChucVu =
                    tenChucVu;

            }


            const moTa =
                getOptionalValue(
                    row,
                    getValue,
                    fieldsCoTrongFile,
                    "moTa"
                );


            if (
                moTa !==
                undefined
            ) {

                item.moTa =
                    moTa;

            }


            const activeRaw =
                getOptionalValue(
                    row,
                    getValue,
                    fieldsCoTrongFile,
                    "active"
                );


            if (
                activeRaw !==
                undefined
            ) {

                try {

                    item.active =
                        toBoolean(
                            activeRaw
                        );

                } catch (error) {

                    throw new ApiError(
                        400,
                        `Dòng ${rowNumber}: trạng thái không hợp lệ.`
                    );

                }

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


    async timChucVuImport(
        item
    ) {

        const coId =
            item.id !==
            undefined;


        const coMa =
            item.maChucVu !==
            undefined;


        /*
         * =====================================================
         * 1. id/k + maChucVu/k
         * =====================================================
         */
        if (
            item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (
                coId &&
                coMa
            ) {

                const theoId =
                    await chucVuRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy chức vụ có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await chucVuRepository
                        .getChiTietByMa(
                            item.maChucVu
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy chức vụ có mã "${item.maChucVu}".`
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
                        `ID ${item.id} và mã "${item.maChucVu}" không cùng một chức vụ.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    chucVu:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            if (
                coId
            ) {

                const theoId =
                    await chucVuRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy chức vụ có ID ${item.id}.`
                    );

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    chucVu:
                        theoId,

                    choPhepSuaMa:
                        false

                };

            }


            if (
                coMa
            ) {

                const theoMa =
                    await chucVuRepository
                        .getChiTietByMa(
                            item.maChucVu
                        );


                if (
                    theoMa
                ) {

                    return {

                        hanhDong:
                            "CAP_NHAT",

                        chucVu:
                            theoMa,

                        choPhepSuaMa:
                            false

                    };

                }


                return {

                    hanhDong:
                        "THEM_MOI",

                    chucVu:
                        null,

                    choPhepSuaMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã chức vụ."
            );

        }


        /*
         * =====================================================
         * 2. id/k + maChucVu
         * =====================================================
         */
        if (
            item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                coId
            ) {

                const theoId =
                    await chucVuRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy chức vụ có ID ${item.id}.`
                    );

                }


                if (
                    coMa
                ) {

                    const theoMa =
                        await chucVuRepository
                            .getChiTietByMa(
                                item.maChucVu
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
                            `Mã chức vụ "${item.maChucVu}" đã tồn tại.`
                        );

                    }

                }


                return {

                    hanhDong:
                        "CAP_NHAT",

                    chucVu:
                        theoId,

                    choPhepSuaMa:
                        true

                };

            }


            /*
             * Header có id/k
             * nhưng dòng không nhập ID.
             *
             * => maChucVu thường
             * => luôn CREATE.
             */
            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới chức vụ phải có mã chức vụ."
                );

            }


            const theoMa =
                await chucVuRepository
                    .getChiTietByMa(
                        item.maChucVu
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã chức vụ "${item.maChucVu}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                chucVu:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        /*
         * =====================================================
         * 3. maChucVu/k
         * =====================================================
         */
        if (
            !item.idLaKhoa &&
            item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã chức vụ không được để trống."
                );

            }


            const theoMa =
                await chucVuRepository
                    .getChiTietByMa(
                        item.maChucVu
                    );


            if (
                theoMa
            ) {

                return {

                    hanhDong:
                        "CAP_NHAT",

                    chucVu:
                        theoMa,

                    choPhepSuaMa:
                        false

                };

            }


            return {

                hanhDong:
                    "THEM_MOI",

                chucVu:
                    null,

                choPhepSuaMa:
                    false

            };

        }


        /*
         * =====================================================
         * 4. maChucVu
         * =====================================================
         */
        if (
            !item.idLaKhoa &&
            !item.maLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã chức vụ không được để trống."
                );

            }


            const theoMa =
                await chucVuRepository
                    .getChiTietByMa(
                        item.maChucVu
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã chức vụ "${item.maChucVu}" đã tồn tại.`
                );

            }


            return {

                hanhDong:
                    "THEM_MOI",

                chucVu:
                    null,

                choPhepSuaMa:
                    true

            };

        }


        throw new ApiError(
            400,
            "Không xác định được cách xử lý dòng import chức vụ."
        );

    }


    validateDongImport(
        item,
        isCreate
    ) {

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
                "ID chức vụ phải là số nguyên lớn hơn 0."
            );

        }


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


        if (
            isCreate &&
            !item.maChucVu
        ) {

            throw new ApiError(
                400,
                "Thêm mới chức vụ phải có mã chức vụ."
            );

        }

    }


    taoDuLieuNghiepVu(
        item
    ) {

        const data =
            {};


        /*
         * Không có cột hoặc ô trống
         * => field không xuất hiện ở data.
         */

        if (
            item.tenChucVu !==
            undefined
        ) {

            data.tenChucVu =
                item.tenChucVu;

        }


        if (
            item.moTa !==
            undefined
        ) {

            data.moTa =
                item.moTa;

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
                    await this
                        .timChucVuImport(
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
                 * =================================================
                 * UPDATE
                 * =================================================
                 */
                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {

                    /*
                     * id/k + maChucVu
                     * => cho phép đổi mã.
                     */
                    if (
                        xuLy.choPhepSuaMa &&
                        item.maChucVu !==
                            undefined
                    ) {

                        if (
                            String(
                                item.maChucVu
                            )
                                .trim()
                                .toUpperCase() !==
                            String(
                                xuLy.chucVu.maChucVu
                            )
                                .trim()
                                .toUpperCase()
                        ) {

                            dataNghiepVu.maChucVu =
                                item.maChucVu;

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
                        await chucVuService
                            .update(
                                xuLy.chucVu.id,
                                dataNghiepVu
                            );


                    ketQua.push({

                        rowNumbers:
                            item.rowNumbers,

                        id:
                            result.id,

                        maChucVu:
                            result.maChucVu,

                        hanhDong:
                            "CAP_NHAT",

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });


                    continue;

                }


                /*
                 * =================================================
                 * CREATE
                 * =================================================
                 */

                dataNghiepVu.maChucVu =
                    item.maChucVu;


                const result =
                    await chucVuService
                        .create(
                            dataNghiepVu
                        );


                ketQua.push({

                    rowNumbers:
                        item.rowNumbers,

                    id:
                        result.id,

                    maChucVu:
                        result.maChucVu,

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
    new ChucVuExcel();