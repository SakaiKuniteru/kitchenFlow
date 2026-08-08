const fs = require( "fs" );

const path = require( "path" );

const ExcelJS = require( "exceljs" );


const ApiError = require( "../../../utils/api-error" );


const thucDonRepository = require( "./thuc-don.repository" );

const thucDonService = require( "./thuc-don.service" );

const baoCaoRepository = require( "../../danh-muc/he-thong/bao-cao/bao-cao.repository" );


const { readExcel } = require( "../../../helpers/excel/excel-reader" );

const { createErrorFile } = require( "../../../helpers/excel/excel-error" );

const { sendExcel } = require( "../../../helpers/excel/excel-response" );

const {
    getCellValue,
    toNumber,
    toBoolean
} = require( "../../../helpers/excel/excel-value" );

const MA_BAO_CAO = "thuc_don";


const HEADER_ROW = 3;

const TEMPLATE_ROW = 5;

const DATA_START_ROW = 5;


class ThucDonExcel {

    async getBaoCao() {

        const baoCao =
            await baoCaoRepository
                .getChiTietByMa(
                    MA_BAO_CAO
                );


        if (!baoCao) {

            throw new ApiError(
                404,
                `Không tìm thấy báo cáo có mã "${MA_BAO_CAO}".`
            );

        }


        if (!baoCao.active) {

            throw new ApiError(
                400,
                "Báo cáo thực đơn đã bị khóa."
            );

        }


        if (
            !baoCao.fileMau ||
            !String(
                baoCao.fileMau
            ).trim()
        ) {

            throw new ApiError(
                400,
                "Báo cáo thực đơn chưa được cấu hình file mẫu."
            );

        }


        return baoCao;

    }

    async getFileMau() {

        const baoCao =
            await this.getBaoCao();


        const fileMau =
            String(
                baoCao.fileMau
            )
                .trim()
                .replace(
                    /^\/+/,
                    ""
                );


        const duongDanFile =
            path.join(
                process.cwd(),
                "src/public",
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

            baoCao,

            duongDanFile

        };

    }

    formatDate(
        value
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return null;

        }


        if (
            value instanceof Date
        ) {

            return value
                .toISOString()
                .slice(
                    0,
                    10
                );

        }


        const text =
            String(
                value
            ).trim();


        if (
            /^\d{4}-\d{2}-\d{2}/
                .test(
                    text
                )
        ) {

            return text.slice(
                0,
                10
            );

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date
            .toISOString()
            .slice(
                0,
                10
            );

    }

    taoDong(
        thucDon,
        ngay = null,
        nhom = null,
        mon = null
    ) {

        return {
            id:
                thucDon.id,

            maThucDon:
                thucDon.maThucDon,

            tenThucDon:
                thucDon.tenThucDon,

            loaiThucDon:
                thucDon.loaiThucDon,

            tuNgay:
                this.formatDate(
                    thucDon.tuNgay
                ),

            denNgay:
                this.formatDate(
                    thucDon.denNgay
                ),

            coSoId:
                thucDon.coSoId,

            maCoSo:
                thucDon.coSo
                    ?.maCoSo,

            nhaAnId:
                thucDon.nhaAnId,

            maNhaAn:
                thucDon.nhaAn
                    ?.maNhaAn,

            caAnId:
                thucDon.caAnId,

            maCaAn:
                thucDon.caAn
                    ?.maCaAn,

            trangThai:
                thucDon.trangThai,

            moTa:
                thucDon.moTa,

            active:
                thucDon.active,


            /*
            * =====================================================
            * NGÀY
            * =====================================================
            */

            thucDonNgayId:
                ngay?.id,

            ngay:
                this.formatDate(
                    ngay?.ngay
                ),

            ghiChuNgay:
                ngay?.ghiChu,

            activeNgay:
                ngay?.active,


            /*
            * =====================================================
            * NHÓM MÓN ĂN
            * =====================================================
            */

            thucDonNhomMonAnId:
                nhom?.id,

            nhomMonAnId:
                nhom?.nhomMonAnId,

            maNhomMonAn:
                nhom?.nhomMonAn
                    ?.maNhomMonAn,

            thuTuNhom:
                nhom?.thuTuHienThi,

            ghiChuNhom:
                nhom?.ghiChu,

            activeNhom:
                nhom?.active,

            thucDonMonAnId:
                mon?.id,

            monAnId:
                mon?.monAnId,

            maMonAn:
                mon?.monAn
                    ?.maMonAn,

            thuTuMon:
                mon?.thuTuHienThi,

            dinhLuong:
                mon?.dinhLuong,

            donViTinhId:
                mon?.donViTinhId,

            maDonViTinh:
                mon?.donViTinh
                    ?.maDonViTinh,

            ghiChuMon:
                mon?.ghiChu,

            activeMon:
                mon?.active

        };

    }

    flatten(
        thucDon
    ) {

        const rows =
            [];


        const dsNgay =
            Array.isArray(
                thucDon.dsNgay
            )
                ? thucDon.dsNgay
                : [];


        if (
            dsNgay.length === 0
        ) {

            rows.push(
                this.taoDong(
                    thucDon
                )
            );

            return rows;

        }


        for (
            const ngay of
            dsNgay
        ) {

            const dsNhom =
                Array.isArray(
                    ngay.dsNhomMonAn
                )
                    ? ngay.dsNhomMonAn
                    : [];


            if (
                dsNhom.length === 0
            ) {

                rows.push(
                    this.taoDong(
                        thucDon,
                        ngay
                    )
                );

                continue;

            }


            for (
                const nhom of
                dsNhom
            ) {

                const dsMon =
                    Array.isArray(
                        nhom.dsMonAn
                    )
                        ? nhom.dsMonAn
                        : [];


                if (
                    dsMon.length === 0
                ) {

                    rows.push(
                        this.taoDong(
                            thucDon,
                            ngay,
                            nhom
                        )
                    );

                    continue;

                }


                for (
                    const mon of
                    dsMon
                ) {

                    rows.push(
                        this.taoDong(
                            thucDon,
                            ngay,
                            nhom,
                            mon
                        )
                    );

                }

            }

        }


        return rows;

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


            targetCell.style =
                JSON.parse(
                    JSON.stringify(
                        sourceCell.style || {}
                    )
                );


            if (
                sourceCell.dataValidation
            ) {

                targetCell.dataValidation =
                    JSON.parse(
                        JSON.stringify(
                            sourceCell.dataValidation
                        )
                    );

            }

        }

    }

    getExportHeaderMap(
        worksheet
    ) {

        const headerMap =
            new Map();


        worksheet
            .getRow(
                HEADER_ROW
            )
            .eachCell(
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
                            getCellValue(
                                cell.value
                            )
                        )
                            .trim();


                    if (!key) {

                        return;

                    }


                    /*
                    * id/k -> id
                    *
                    * maThucDon/k -> maThucDon
                    */
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
            * Không phải field mà hệ thống xuất
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
            * Không có dữ liệu
            * => bỏ qua.
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
    async xuLyExport(
        query = {}
    ) {

        const {
            baoCao,
            duongDanFile
        } =
            await this.getFileMau();


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
                "Không thể đọc file mẫu thực đơn."
            );

        }


        const worksheet =
            workbook.worksheets[0];


        if (!worksheet) {

            throw new ApiError(
                400,
                "File mẫu thực đơn không có sheet dữ liệu."
            );

        }


        const danhSach =
            await thucDonRepository
                .getTongHop(
                    query
                );


        const rows =
            [];


        for (
            const item of
            danhSach
        ) {

            const thucDon =
                await thucDonRepository
                    .getChiTiet(
                        item.id
                    );


            if (!thucDon) {

                continue;

            }


            rows.push(
                ...this.flatten(
                    thucDon
                )
            );

        }


        if (
            rows.length === 0
        ) {

            for (
                let columnNumber = 1;
                columnNumber <= SO_COT;
                columnNumber++
            ) {

                worksheet
                    .getCell(
                        TEMPLATE_ROW,
                        columnNumber
                    )
                    .value =
                    null;

            }

        } else {

            for (
                let index = 0;
                index < rows.length;
                index++
            ) {

                const rowNumber =
                    TEMPLATE_ROW +
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


                worksheet
                    .getRow(
                        rowNumber
                    )
                    .values =
                    rows[index];

            }

        }


        const buffer =
            await workbook.xlsx
                .writeBuffer();


        return {

            fileName: `${baoCao.maBaoCao}.xlsx`,

            buffer

        };

    }

    exportData =
        async (
            req,
            res,
            next
        ) => {

            try {

                const result =
                    await this
                        .xuLyExport(
                            req.query
                        );


                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(error);

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
                "maThucDon/k"
            );


        const hasMaNormal =
            headerMap.has(
                "maThucDon"
            );


        /*
        * Mã vẫn là field dùng xác định
        * CREATE / UPDATE.
        */
        if (
            !hasMaKey &&
            !hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import phải có field maThucDon hoặc maThucDon/k."
            );

        }


        if (
            hasMaKey &&
            hasMaNormal
        ) {

            throw new ApiError(
                400,
                "File import không được đồng thời có maThucDon và maThucDon/k."
            );

        }


        return {

            idLaKhoa:
                hasIdKey,

            maThucDonLaKhoa:
                hasMaKey,

            fieldMaThucDon:
                hasMaKey
                    ? "maThucDon/k"
                    : "maThucDon",

            /*
            * Danh sách key thực tế
            * đang tồn tại trong file.
            */
            fieldsCoTrongFile:
                new Set(
                    [
                        ...headerMap.keys()
                    ]
                )

        };

    }

    getOptionalValue(
        row,
        getValue,
        field
    ) {

        const value =
            getValue(
                row,
                field
            );


        if (
            value === undefined ||
            value === null ||
            String(
                value
            ).trim() === ""
        ) {

            return undefined;

        }


        return value;

    }

    getOptionalNumber(
        row,
        getValue,
        field
    ) {

        const value =
            this.getOptionalValue(
                row,
                getValue,
                field
            );


        if (
            value === undefined
        ) {

            return undefined;

        }


        return toNumber(
            value
        );

    }

    getOptionalDate(
        row,
        getValue,
        field
    ) {

        const value =
            this.getOptionalValue(
                row,
                getValue,
                field
            );


        if (
            value === undefined
        ) {

            return undefined;

        }


        return this.formatDate(
            value
        );

    }

    getOptionalBoolean(
        row,
        getValue,
        field,
        rowNumber
    ) {

        const value =
            this.getOptionalValue(
                row,
                getValue,
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
                `Dòng ${rowNumber}: ${field} không hợp lệ.`
            );

        }

    }

    gomDuLieuImport(
        worksheet,
        getValue,
        cauHinhHeader
    ) {

        const {
            idLaKhoa,
            maThucDonLaKhoa,
            fieldMaThucDon,
            fieldsCoTrongFile
        } = cauHinhHeader;


        const danhSach =
            new Map();


        /*
        * =========================================================
        * HELPER
        * =========================================================
        */

        const isBlank =
            value => {

                return (
                    value === undefined ||
                    value === null ||
                    String(
                        value
                    ).trim() === ""
                );

            };


        const getOptionalValue =
            (
                row,
                field
            ) => {

                /*
                * File không có key này
                * => bỏ qua.
                */
                if (
                    !fieldsCoTrongFile.has(
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
                    isBlank(
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


                return toNumber(
                    value
                );

            };


        const getOptionalDate =
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


                return this.formatDate(
                    value
                );

            };


        const getOptionalBoolean =
            (
                row,
                field,
                rowNumber
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
                        `Dòng ${rowNumber}: ${field} không hợp lệ.`
                    );

                }

            };


        /*
        * =========================================================
        * DUYỆT TỪNG DÒNG
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
            * =====================================================
            * KIỂM TRA DÒNG CÓ DỮ LIỆU KHÔNG
            *
            * Không quét theo số cột.
            * Chỉ đọc những key thực sự tồn tại trong file.
            * =====================================================
            */

            const values =
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


            const coTemplate =
                values.some(
                    value =>
                        typeof value ===
                            "string" &&
                        value.includes(
                            "[["
                        )
                );


            if (
                coTemplate
            ) {

                continue;

            }


            const coDuLieu =
                values.some(
                    value =>
                        !isBlank(
                            value
                        )
                );


            if (
                !coDuLieu
            ) {

                continue;

            }


            /*
            * =====================================================
            * KHÓA THỰC ĐƠN
            * =====================================================
            */

            const id =
                idLaKhoa
                    ? getOptionalNumber(
                        row,
                        "id/k"
                    )
                    : undefined;


            let maThucDon;


            if (
                fieldsCoTrongFile.has(
                    fieldMaThucDon
                )
            ) {

                const maRaw =
                    getOptionalValue(
                        row,
                        fieldMaThucDon
                    );


                maThucDon =
                    maRaw !== undefined
                        ? String(
                            maRaw
                        ).trim()
                        : undefined;

            }


            /*
            * =====================================================
            * KEY GROUP
            * =====================================================
            */

            let key;


            if (
                id !== undefined
            ) {

                key =
                    `ID:${id}`;

            } else if (
                maThucDon !==
                    undefined
            ) {

                key =
                    `MA:${
                        String(
                            maThucDon
                        )
                            .trim()
                            .toLowerCase()
                    }`;

            } else {

                key =
                    `ROW:${rowNumber}`;

            }


            /*
            * =====================================================
            * TẠO THỰC ĐƠN GỐC
            * =====================================================
            */

            if (
                !danhSach.has(
                    key
                )
            ) {

                const thucDon = {

                    rowNumbers:
                        [],

                    fieldsCoTrongFile,

                    id,

                    idLaKhoa,

                    maThucDon,

                    maThucDonLaKhoa,

                    dsNgay:
                        []

                };


                const tenThucDon =
                    getOptionalValue(
                        row,
                        "tenThucDon"
                    );

                if (
                    tenThucDon !==
                    undefined
                ) {

                    thucDon.tenThucDon =
                        tenThucDon;

                }


                const loaiThucDon =
                    getOptionalNumber(
                        row,
                        "loaiThucDon"
                    );

                if (
                    loaiThucDon !==
                    undefined
                ) {

                    thucDon.loaiThucDon =
                        loaiThucDon;

                }


                const tuNgay =
                    getOptionalDate(
                        row,
                        "tuNgay"
                    );

                if (
                    tuNgay !==
                    undefined
                ) {

                    thucDon.tuNgay =
                        tuNgay;

                }


                const denNgay =
                    getOptionalDate(
                        row,
                        "denNgay"
                    );

                if (
                    denNgay !==
                    undefined
                ) {

                    thucDon.denNgay =
                        denNgay;

                }


                const coSoId =
                    getOptionalNumber(
                        row,
                        "coSoId"
                    );

                if (
                    coSoId !==
                    undefined
                ) {

                    thucDon.coSoId =
                        coSoId;

                }


                const maCoSo =
                    getOptionalValue(
                        row,
                        "maCoSo"
                    );

                if (
                    maCoSo !==
                    undefined
                ) {

                    thucDon.maCoSo =
                        maCoSo;

                }


                const nhaAnId =
                    getOptionalNumber(
                        row,
                        "nhaAnId"
                    );

                if (
                    nhaAnId !==
                    undefined
                ) {

                    thucDon.nhaAnId =
                        nhaAnId;

                }


                const maNhaAn =
                    getOptionalValue(
                        row,
                        "maNhaAn"
                    );

                if (
                    maNhaAn !==
                    undefined
                ) {

                    thucDon.maNhaAn =
                        maNhaAn;

                }


                const caAnId =
                    getOptionalNumber(
                        row,
                        "caAnId"
                    );

                if (
                    caAnId !==
                    undefined
                ) {

                    thucDon.caAnId =
                        caAnId;

                }


                const maCaAn =
                    getOptionalValue(
                        row,
                        "maCaAn"
                    );

                if (
                    maCaAn !==
                    undefined
                ) {

                    thucDon.maCaAn =
                        maCaAn;

                }


                const trangThai =
                    getOptionalNumber(
                        row,
                        "trangThai"
                    );

                if (
                    trangThai !==
                    undefined
                ) {

                    thucDon.trangThai =
                        trangThai;

                }


                const moTa =
                    getOptionalValue(
                        row,
                        "moTa"
                    );

                if (
                    moTa !==
                    undefined
                ) {

                    thucDon.moTa =
                        moTa;

                }


                const active =
                    getOptionalBoolean(
                        row,
                        "active",
                        rowNumber
                    );

                if (
                    active !==
                    undefined
                ) {

                    thucDon.active =
                        active;

                }


                danhSach.set(
                    key,
                    thucDon
                );

            }


            const thucDon =
                danhSach.get(
                    key
                );


            thucDon
                .rowNumbers
                .push(
                    rowNumber
                );

            const ngayValue =
                getOptionalDate(
                    row,
                    "ngay"
                );


            if (
                ngayValue ===
                undefined
            ) {

                continue;

            }


            let ngay =
                thucDon.dsNgay
                    .find(
                        item =>
                            item.ngay ===
                            ngayValue
                    );


            if (
                !ngay
            ) {

                ngay = {

                    ngay:
                        ngayValue,

                    dsNhomMonAn:
                        []

                };


                const thucDonNgayId =
                    getOptionalNumber(
                        row,
                        "thucDonNgayId"
                    );

                if (
                    thucDonNgayId !==
                    undefined
                ) {

                    ngay.id =
                        thucDonNgayId;

                }


                const ghiChuNgay =
                    getOptionalValue(
                        row,
                        "ghiChuNgay"
                    );

                if (
                    ghiChuNgay !==
                    undefined
                ) {

                    ngay.ghiChu =
                        ghiChuNgay;

                }


                const activeNgay =
                    getOptionalBoolean(
                        row,
                        "activeNgay",
                        rowNumber
                    );

                if (
                    activeNgay !==
                    undefined
                ) {

                    ngay.active =
                        activeNgay;

                }


                thucDon.dsNgay.push(
                    ngay
                );

            }


            /*
            * =====================================================
            * NHÓM MÓN ĂN
            * =====================================================
            */

            const nhomMonAnId =
                getOptionalNumber(
                    row,
                    "nhomMonAnId"
                );


            const maNhomMonAn =
                getOptionalValue(
                    row,
                    "maNhomMonAn"
                );


            if (
                nhomMonAnId ===
                    undefined &&
                maNhomMonAn ===
                    undefined
            ) {

                continue;

            }


            let nhom =
                ngay.dsNhomMonAn
                    .find(
                        item =>
                            (
                                nhomMonAnId !==
                                    undefined &&
                                item.nhomMonAnId !==
                                    undefined &&
                                Number(
                                    item.nhomMonAnId
                                ) ===
                                Number(
                                    nhomMonAnId
                                )
                            ) ||
                            (
                                maNhomMonAn !==
                                    undefined &&
                                item.maNhomMonAn !==
                                    undefined &&
                                String(
                                    item.maNhomMonAn
                                )
                                    .trim()
                                    .toUpperCase() ===
                                String(
                                    maNhomMonAn
                                )
                                    .trim()
                                    .toUpperCase()
                            )
                    );


            if (
                !nhom
            ) {

                nhom = {

                    dsMonAn:
                        []

                };


                const thucDonNhomMonAnId =
                    getOptionalNumber(
                        row,
                        "thucDonNhomMonAnId"
                    );

                if (
                    thucDonNhomMonAnId !==
                    undefined
                ) {

                    nhom.id =
                        thucDonNhomMonAnId;

                }


                if (
                    nhomMonAnId !==
                    undefined
                ) {

                    nhom.nhomMonAnId =
                        nhomMonAnId;

                }


                if (
                    maNhomMonAn !==
                    undefined
                ) {

                    nhom.maNhomMonAn =
                        maNhomMonAn;

                }


                const thuTuNhom =
                    getOptionalNumber(
                        row,
                        "thuTuNhom"
                    );

                if (
                    thuTuNhom !==
                    undefined
                ) {

                    nhom.thuTuHienThi =
                        thuTuNhom;

                }


                const ghiChuNhom =
                    getOptionalValue(
                        row,
                        "ghiChuNhom"
                    );

                if (
                    ghiChuNhom !==
                    undefined
                ) {

                    nhom.ghiChu =
                        ghiChuNhom;

                }


                const activeNhom =
                    getOptionalBoolean(
                        row,
                        "activeNhom",
                        rowNumber
                    );

                if (
                    activeNhom !==
                    undefined
                ) {

                    nhom.active =
                        activeNhom;

                }


                ngay
                    .dsNhomMonAn
                    .push(
                        nhom
                    );

            }


            /*
            * =====================================================
            * MÓN ĂN
            * =====================================================
            */

            const monAnId =
                getOptionalNumber(
                    row,
                    "monAnId"
                );


            const maMonAn =
                getOptionalValue(
                    row,
                    "maMonAn"
                );


            if (
                monAnId ===
                    undefined &&
                maMonAn ===
                    undefined
            ) {

                continue;

            }


            const mon = {};


            const thucDonMonAnId =
                getOptionalNumber(
                    row,
                    "thucDonMonAnId"
                );

            if (
                thucDonMonAnId !==
                undefined
            ) {

                mon.id =
                    thucDonMonAnId;

            }


            if (
                monAnId !==
                undefined
            ) {

                mon.monAnId =
                    monAnId;

            }


            if (
                maMonAn !==
                undefined
            ) {

                mon.maMonAn =
                    maMonAn;

            }


            const thuTuMon =
                getOptionalNumber(
                    row,
                    "thuTuMon"
                );

            if (
                thuTuMon !==
                undefined
            ) {

                mon.thuTuHienThi =
                    thuTuMon;

            }


            const dinhLuong =
                getOptionalNumber(
                    row,
                    "dinhLuong"
                );

            if (
                dinhLuong !==
                undefined
            ) {

                mon.dinhLuong =
                    dinhLuong;

            }


            const donViTinhId =
                getOptionalNumber(
                    row,
                    "donViTinhId"
                );

            if (
                donViTinhId !==
                undefined
            ) {

                mon.donViTinhId =
                    donViTinhId;

            }


            const maDonViTinh =
                getOptionalValue(
                    row,
                    "maDonViTinh"
                );

            if (
                maDonViTinh !==
                undefined
            ) {

                mon.maDonViTinh =
                    maDonViTinh;

            }


            const ghiChuMon =
                getOptionalValue(
                    row,
                    "ghiChuMon"
                );

            if (
                ghiChuMon !==
                undefined
            ) {

                mon.ghiChu =
                    ghiChuMon;

            }


            const activeMon =
                getOptionalBoolean(
                    row,
                    "activeMon",
                    rowNumber
                );

            if (
                activeMon !==
                undefined
            ) {

                mon.active =
                    activeMon;

            }


            nhom.dsMonAn.push(
                mon
            );

        }


        return Array.from(
            danhSach.values()
        );

    }

    removeEmptyFields(
        value
    ) {

        if (
            Array.isArray(
                value
            )
        ) {

            return value
                .map(
                    item =>
                        this.removeEmptyFields(
                            item
                        )
                );

        }


        if (
            value &&
            typeof value ===
                "object"
        ) {

            const result =
                {};


            for (
                const [
                    key,
                    itemValue
                ] of Object.entries(
                    value
                )
            ) {

                if (
                    itemValue === undefined ||
                    itemValue === null ||
                    itemValue === ""
                ) {

                    continue;

                }


                result[key] =
                    this.removeEmptyFields(
                        itemValue
                    );

            }


            return result;

        }


        return value;

    }

    taoDuLieuNghiepVu(
        item
    ) {

        const data = {};


        const fields = [

            "tenThucDon",

            "loaiThucDon",

            "tuNgay",

            "denNgay",

            "coSoId",

            "maCoSo",

            "nhaAnId",

            "maNhaAn",

            "caAnId",

            "maCaAn",

            "trangThai",

            "moTa",

            "active"

        ];


        for (
            const field of
            fields
        ) {

            if (
                item[field] !==
                undefined &&
                item[field] !==
                null &&
                item[field] !==
                ""
            ) {

                data[field] =
                    item[field];

            }

        }


        /*
        * Chỉ truyền cấu trúc ngày
        * nếu thực sự có dữ liệu ngày.
        */
        if (
            Array.isArray(
                item.dsNgay
            ) &&
            item.dsNgay.length > 0
        ) {

            data.dsNgay =
                item.dsNgay;

        }


        return data;

    }

    async timThucDonImport(
        item
    ) {

        const coId =
            item.id !== null &&
            item.id !== undefined;


        const coMa =
            Boolean(
                item.maThucDon
            );

        if (
            item.idLaKhoa &&
            item.maThucDonLaKhoa
        ) {

            if (
                coId &&
                coMa
            ) {

                const theoId =
                    await thucDonRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy thực đơn có ID ${item.id}.`
                    );

                }


                const theoMa =
                    await thucDonRepository
                        .getChiTietByMa(
                            item.maThucDon
                        );


                if (!theoMa) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy thực đơn có mã "${item.maThucDon}".`
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
                        `ID ${item.id} và mã "${item.maThucDon}" không cùng một thực đơn.`
                    );

                }


                return {

                    banGhi:
                        theoId,

                    hanhDong:
                        "CAP_NHAT",

                    choPhepCapNhatMa:
                        false

                };

            }

            if (
                coId
            ) {

                const theoId =
                    await thucDonRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy thực đơn có ID ${item.id}.`
                    );

                }


                return {

                    banGhi:
                        theoId,

                    hanhDong:
                        "CAP_NHAT",

                    choPhepCapNhatMa:
                        false

                };

            }

            if (
                coMa
            ) {

                const theoMa =
                    await thucDonRepository
                        .getChiTietByMa(
                            item.maThucDon
                        );


                if (
                    theoMa
                ) {

                    return {

                        banGhi:
                            theoMa,

                        hanhDong:
                            "CAP_NHAT",

                        choPhepCapNhatMa:
                            false

                    };

                }


                return {

                    banGhi:
                        null,

                    hanhDong:
                        "THEM_MOI",

                    choPhepCapNhatMa:
                        false

                };

            }


            throw new ApiError(
                400,
                "Phải nhập ID hoặc mã thực đơn."
            );

        }

        if (
            item.idLaKhoa &&
            !item.maThucDonLaKhoa
        ) {

            if (
                coId
            ) {

                const theoId =
                    await thucDonRepository
                        .getChiTiet(
                            Number(
                                item.id
                            )
                        );


                if (!theoId) {

                    throw new ApiError(
                        404,
                        `Không tìm thấy thực đơn có ID ${item.id}.`
                    );

                }

                if (
                    coMa
                ) {

                    const theoMa =
                        await thucDonRepository
                            .getChiTietByMa(
                                item.maThucDon
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
                            `Mã thực đơn "${item.maThucDon}" đã tồn tại.`
                        );

                    }

                }


                return {

                    banGhi:
                        theoId,

                    hanhDong:
                        "CAP_NHAT",

                    choPhepCapNhatMa:
                        true

                };

            }

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới thực đơn phải có mã thực đơn."
                );

            }


            const theoMa =
                await thucDonRepository
                    .getChiTietByMa(
                        item.maThucDon
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã thực đơn "${item.maThucDon}" đã tồn tại.`
                );

            }


            return {

                banGhi:
                    null,

                hanhDong:
                    "THEM_MOI",

                choPhepCapNhatMa:
                    true

            };

        }

        if (
            !item.idLaKhoa &&
            item.maThucDonLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã thực đơn không được để trống."
                );

            }


            const theoMa =
                await thucDonRepository
                    .getChiTietByMa(
                        item.maThucDon
                    );


            if (
                theoMa
            ) {

                return {

                    banGhi:
                        theoMa,

                    hanhDong:
                        "CAP_NHAT",

                    choPhepCapNhatMa:
                        false

                };

            }


            return {

                banGhi:
                    null,

                hanhDong:
                    "THEM_MOI",

                choPhepCapNhatMa:
                    false

            };

        }

        if (
            !item.idLaKhoa &&
            !item.maThucDonLaKhoa
        ) {

            if (
                !coMa
            ) {

                throw new ApiError(
                    400,
                    "Mã thực đơn không được để trống."
                );

            }


            const theoMa =
                await thucDonRepository
                    .getChiTietByMa(
                        item.maThucDon
                    );


            if (
                theoMa
            ) {

                throw new ApiError(
                    409,
                    `Mã thực đơn "${item.maThucDon}" đã tồn tại.`
                );

            }


            return {

                banGhi:
                    null,

                hanhDong:
                    "THEM_MOI",

                choPhepCapNhatMa:
                    true

            };

        }


        throw new ApiError(
            400,
            "Không xác định được cách xử lý dòng import thực đơn."
        );

    }

    async xuLyImport(
        file
    ) {

        await this.getBaoCao();


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


        const cauHinhHeader =
            this.validateHeaders(
                headerMap
            );


        const danhSach =
            this.gomDuLieuImport(
                worksheet,
                getValue,
                cauHinhHeader
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
                        .timThucDonImport(
                            item
                        );


                const data =
                    this.taoDuLieuNghiepVu(
                        item
                    );


                /*
                * =====================================================
                * CẬP NHẬT
                * =====================================================
                */
                if (
                    xuLy.hanhDong ===
                    "CAP_NHAT"
                ) {

                    /*
                    * Chỉ được sửa mã
                    * khi maThucDon không phải /k.
                    *
                    * Nếu mã mới giống mã hiện tại
                    * thì không cần truyền xuống service.
                    */
                    if (
                        xuLy.choPhepCapNhatMa &&
                        item.maThucDon !==
                            undefined &&
                        String(
                            item.maThucDon
                        )
                            .trim()
                            .toUpperCase() !==
                        String(
                            xuLy.banGhi.maThucDon
                        )
                            .trim()
                            .toUpperCase()
                    ) {

                        data.maThucDon =
                            item.maThucDon;

                    }


                    /*
                    * Không có field nào thực sự
                    * được nhập để cập nhật.
                    */
                    if (
                        Object.keys(
                            data
                        ).length === 0
                    ) {

                        throw new ApiError(
                            400,
                            "Không có dữ liệu cần cập nhật."
                        );

                    }


                    const result =
                        await thucDonService
                            .update(
                                xuLy.banGhi.id,
                                data
                            );


                    ketQua.push({

                        id:
                            result.id,

                        maThucDon:
                            result.maThucDon,

                        hanhDong:
                            "CAP_NHAT",

                        rowNumbers:
                            item.rowNumbers,

                        message:
                            `Cập nhật thành công - ID ${result.id}`

                    });


                    continue;

                }


                /*
                * =====================================================
                * THÊM MỚI
                * =====================================================
                */

                if (
                    !item.maThucDon
                ) {

                    throw new ApiError(
                        400,
                        "Thêm mới thực đơn phải có mã thực đơn."
                    );

                }


                data.maThucDon =
                    item.maThucDon;


                /*
                * Default nghiệp vụ chỉ áp dụng
                * khi tạo mới.
                */
                if (
                    data.trangThai ===
                    undefined
                ) {

                    data.trangThai =
                        10;

                }


                const result =
                    await thucDonService
                        .create(
                            data
                        );


                ketQua.push({

                    id:
                        result.id,

                    maThucDon:
                        result.maThucDon,

                    hanhDong:
                        "THEM_MOI",

                    rowNumbers:
                        item.rowNumbers,

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


        return await this
            .taoFileKetQuaImport(
                workbook,
                worksheet,
                ketQua,
                errors
            );

    }

    async taoFileKetQuaImport(
        workbook,
        worksheet,
        ketQua,
        errors
    ) {

        const resultColumn =
            worksheet.columnCount + 1;

        const errorColumn =
            worksheet.columnCount + 2;

        worksheet
            .getRow(2)
            .getCell(
                resultColumn
            )
            .value =
            "Text";


        worksheet
            .getRow(2)
            .getCell(
                errorColumn
            )
            .value =
            "Text";

        worksheet
            .getRow(
                HEADER_ROW
            )
            .getCell(
                resultColumn
            )
            .value =
            "ketQua";


        worksheet
            .getRow(
                HEADER_ROW
            )
            .getCell(
                errorColumn
            )
            .value =
            "baoLoi";

        worksheet
            .getRow(4)
            .getCell(
                resultColumn
            )
            .value =
            "Kết quả xử lý import";


        worksheet
            .getRow(4)
            .getCell(
                errorColumn
            )
            .value =
            "Thông báo lỗi import";

        for (
            const item of
            ketQua
        ) {

            const noiDung =
                item.message ||
                (
                    item.hanhDong ===
                    "THEM_MOI"
                        ? `Thêm mới thành công - ID ${item.id}`
                        : `Cập nhật thành công - ID ${item.id}`
                );


            for (
                const rowNumber of
                item.rowNumbers
            ) {

                const cell =
                    worksheet
                        .getRow(
                            rowNumber
                        )
                        .getCell(
                            resultColumn
                        );


                cell.value =
                    noiDung;


                cell.font = {

                    color: {
                        argb:
                            "FF008000"
                    },

                    bold:
                        true

                };


                cell.alignment = {

                    vertical:
                        "top",

                    wrapText:
                        true

                };

            }

        }

        for (
            const error of
            errors
        ) {

            for (
                const rowNumber of
                error.rowNumbers
            ) {

                const cell =
                    worksheet
                        .getRow(
                            rowNumber
                        )
                        .getCell(
                            errorColumn
                        );


                cell.value =
                    error.message;


                cell.font = {

                    color: {
                        argb:
                            "FFFF0000"
                    },

                    bold:
                        true

                };


                cell.alignment = {

                    vertical:
                        "top",

                    wrapText:
                        true

                };

            }

        }


        worksheet
            .getColumn(
                resultColumn
            )
            .width =
            40;


        worksheet
            .getColumn(
                errorColumn
            )
            .width =
            55;


        const buffer =
            await workbook.xlsx
                .writeBuffer();


        return {

            coLoi:
                errors.length > 0,

            fileName:
                `${MA_BAO_CAO}.xlsx`,

            buffer,

            data: {

                tongSo:
                    ketQua.length +
                    errors.length,

                thanhCong:
                    ketQua.length,

                thatBai:
                    errors.length

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


                return sendExcel(
                    res,
                    result
                );

            } catch (error) {

                next(error);

            }

        };

}


module.exports =
    new ThucDonExcel();