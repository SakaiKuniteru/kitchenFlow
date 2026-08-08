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

const SO_COT = 34;

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

        return [

            thucDon.id ?? null,

            thucDon.maThucDon ?? null,

            thucDon.tenThucDon ?? null,

            thucDon.loaiThucDon ?? null,

            this.formatDate(
                thucDon.tuNgay
            ),

            this.formatDate(
                thucDon.denNgay
            ),

            thucDon.coSoId ?? null,

            thucDon.coSo
                ?.maCoSo ??
            null,

            thucDon.nhaAnId ?? null,

            thucDon.nhaAn
                ?.maNhaAn ??
            null,

            thucDon.caAnId ?? null,

            thucDon.caAn
                ?.maCaAn ??
            null,

            thucDon.trangThai ?? null,

            thucDon.moTa ?? null,

            thucDon.active ?? true,


            /* Ngày */

            ngay?.id ?? null,

            this.formatDate(
                ngay?.ngay
            ),

            ngay?.ghiChu ?? null,

            ngay?.active ?? true,


            /* Nhóm */

            nhom?.id ?? null,

            nhom?.nhomMonAnId ?? null,

            nhom?.nhomMonAn
                ?.maNhomMonAn ??
            null,

            nhom?.thuTuHienThi ?? null,

            nhom?.ghiChu ?? null,

            nhom?.active ?? true,


            /* Món */

            mon?.id ?? null,

            mon?.monAnId ?? null,

            mon?.monAn
                ?.maMonAn ??
            null,

            mon?.thuTuHienThi ?? null,

            mon?.dinhLuong ?? null,

            mon?.donViTinhId ?? null,

            mon?.donViTinh
                ?.maDonViTinh ??
            null,

            mon?.ghiChu ?? null,

            mon?.active ?? true

        ];

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
            columnNumber <= SO_COT;
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

            fileName:
                `${
                    baoCao.maBaoCao
                }_${
                    Date.now()
                }.xlsx`,

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

        /*
        * Các field cấu trúc bắt buộc phải tồn tại
        * trong file mẫu.
        *
        * maThucDon được xử lý riêng vì chấp nhận:
        *
        * maThucDon/k
        * hoặc
        * maThucDon
        */

        const requiredHeaders = [

            "id/k",

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

            "active",

            "thucDonNgayId",

            "ngay",

            "ghiChuNgay",

            "activeNgay",

            "thucDonNhomMonAnId",

            "nhomMonAnId",

            "maNhomMonAn",

            "thuTuNhom",

            "ghiChuNhom",

            "activeNhom",

            "thucDonMonAnId",

            "monAnId",

            "maMonAn",

            "thuTuMon",

            "dinhLuong",

            "donViTinhId",

            "maDonViTinh",

            "ghiChuMon",

            "activeMon"

        ];


        for (
            const field of
            requiredHeaders
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


        const coMaKhoa =
            headerMap.has(
                "maThucDon/k"
            );

        const coMaThuong =
            headerMap.has(
                "maThucDon"
            );


        if (
            !coMaKhoa &&
            !coMaThuong
        ) {

            throw new ApiError(
                400,
                "File import phải có field maThucDon/k hoặc maThucDon."
            );

        }


        /*
        * Không cho tồn tại cả hai cùng lúc
        * vì sẽ gây mơ hồ nghiệp vụ.
        */

        if (
            coMaKhoa &&
            coMaThuong
        ) {

            throw new ApiError(
                400,
                "File import chỉ được dùng một trong hai field maThucDon/k hoặc maThucDon."
            );

        }


        return {

            maThucDonLaKhoa:
                coMaKhoa,

            fieldMaThucDon:
                coMaKhoa
                    ? "maThucDon/k"
                    : "maThucDon"

        };

    }

    gomDuLieuImport(
        worksheet,
        getValue,
        cauHinhHeader
    ) {

        const {
            maThucDonLaKhoa,
            fieldMaThucDon
        } = cauHinhHeader;

        const danhSach =
            new Map();


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

            const values =
                [];

            for (
                let col = 1;
                col <= SO_COT;
                col++
            ) {

                values.push(
                    getCellValue(
                        row
                            .getCell(
                                col
                            )
                            .value
                    )
                );

            }


            const coTemplate =
                values.some(
                    value =>
                        typeof value ===
                            "string" &&
                        value.includes(
                            "[["
                        )
                );


            if (coTemplate) {

                continue;

            }


            const coDuLieu =
                values.some(
                    value =>
                        value !== null &&
                        value !== undefined &&
                        String(
                            value
                        ).trim() !== ""
                );


            if (!coDuLieu) {

                continue;

            }


            const id =
                toNumber(
                    getValue(
                        row,
                        "id/k"
                    )
                );


            const maThucDonRaw =
                getValue(
                    row,
                    fieldMaThucDon
                );


            const maThucDon =
                maThucDonRaw !== undefined &&
                maThucDonRaw !== null &&
                String(
                    maThucDonRaw
                ).trim() !== ""
                    ? String(
                        maThucDonRaw
                    ).trim()
                    : null;

            let key;

            if (
                id
            ) {

                key =
                    `ID:${id}`;

            } else if (
                maThucDon
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

            if (
                !danhSach.has(
                    key
                )
            ) {

                let active =
                    true;


                try {

                    active =
                        toBoolean(
                            getValue(
                                row,
                                "active"
                            ),
                            true
                        );

                } catch (error) {

                    throw new ApiError(
                        400,
                        `Dòng ${rowNumber}: Trạng thái active không hợp lệ.`
                    );

                }


                danhSach.set(
                    key,
                    {

                        rowNumbers:
                            [],

                        id,

                        maThucDon,

                        maThucDonLaKhoa,

                        tenThucDon:
                            getValue(
                                row,
                                "tenThucDon"
                            ),

                        loaiThucDon:
                            toNumber(
                                getValue(
                                    row,
                                    "loaiThucDon"
                                )
                            ),

                        tuNgay:
                            this.formatDate(
                                getValue(
                                    row,
                                    "tuNgay"
                                )
                            ),

                        denNgay:
                            this.formatDate(
                                getValue(
                                    row,
                                    "denNgay"
                                )
                            ),

                        coSoId:
                            toNumber(
                                getValue(
                                    row,
                                    "coSoId"
                                )
                            ),

                        maCoSo:
                            getValue(
                                row,
                                "maCoSo"
                            ),

                        nhaAnId:
                            toNumber(
                                getValue(
                                    row,
                                    "nhaAnId"
                                )
                            ),

                        maNhaAn:
                            getValue(
                                row,
                                "maNhaAn"
                            ),

                        caAnId:
                            toNumber(
                                getValue(
                                    row,
                                    "caAnId"
                                )
                            ),

                        maCaAn:
                            getValue(
                                row,
                                "maCaAn"
                            ),

                        trangThai:
                            toNumber(
                                getValue(
                                    row,
                                    "trangThai"
                                )
                            ) ?? 10,

                        moTa:
                            getValue(
                                row,
                                "moTa"
                            ),

                        active,

                        dsNgay:
                            []

                    }
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
                this.formatDate(
                    getValue(
                        row,
                        "ngay"
                    )
                );


            if (!ngayValue) {

                continue;

            }


            let ngay =
                thucDon.dsNgay.find(
                    item =>
                        item.ngay ===
                        ngayValue
                );


            if (!ngay) {

                let activeNgay =
                    true;


                try {

                    activeNgay =
                        toBoolean(
                            getValue(
                                row,
                                "activeNgay"
                            ),
                            true
                        );

                } catch (error) {

                    throw new ApiError(
                        400,
                        `Dòng ${rowNumber}: activeNgay không hợp lệ.`
                    );

                }


                ngay = {

                    ngay:
                        ngayValue,

                    ghiChu:
                        getValue(
                            row,
                            "ghiChuNgay"
                        ),

                    active:
                        activeNgay,

                    dsNhomMonAn:
                        []

                };


                thucDon.dsNgay.push(
                    ngay
                );

            }


            const nhomMonAnId =
                toNumber(
                    getValue(
                        row,
                        "nhomMonAnId"
                    )
                );


            const maNhomMonAn =
                getValue(
                    row,
                    "maNhomMonAn"
                );


            if (
                !nhomMonAnId &&
                !maNhomMonAn
            ) {

                continue;

            }


            let nhom =
                ngay.dsNhomMonAn
                    .find(
                        item =>
                            (
                                nhomMonAnId &&
                                Number(
                                    item.nhomMonAnId
                                ) ===
                                Number(
                                    nhomMonAnId
                                )
                            ) ||
                            (
                                maNhomMonAn &&
                                String(
                                    item.maNhomMonAn ||
                                    ""
                                )
                                    .toUpperCase() ===
                                String(
                                    maNhomMonAn
                                )
                                    .toUpperCase()
                            )
                    );


            if (!nhom) {

                let activeNhom =
                    true;


                try {

                    activeNhom =
                        toBoolean(
                            getValue(
                                row,
                                "activeNhom"
                            ),
                            true
                        );

                } catch (error) {

                    throw new ApiError(
                        400,
                        `Dòng ${rowNumber}: activeNhom không hợp lệ.`
                    );

                }


                nhom = {

                    nhomMonAnId,

                    maNhomMonAn,

                    thuTuHienThi:
                        toNumber(
                            getValue(
                                row,
                                "thuTuNhom"
                            )
                        ),

                    ghiChu:
                        getValue(
                            row,
                            "ghiChuNhom"
                        ),

                    active:
                        activeNhom,

                    dsMonAn:
                        []

                };


                ngay
                    .dsNhomMonAn
                    .push(
                        nhom
                    );

            }


            const monAnId =
                toNumber(
                    getValue(
                        row,
                        "monAnId"
                    )
                );


            const maMonAn =
                getValue(
                    row,
                    "maMonAn"
                );


            if (
                !monAnId &&
                !maMonAn
            ) {

                continue;

            }


            let activeMon =
                true;


            try {

                activeMon =
                    toBoolean(
                        getValue(
                            row,
                            "activeMon"
                        ),
                        true
                    );

            } catch (error) {

                throw new ApiError(
                    400,
                    `Dòng ${rowNumber}: activeMon không hợp lệ.`
                );

            }


            nhom.dsMonAn.push({

                monAnId,

                maMonAn,

                thuTuHienThi:
                    toNumber(
                        getValue(
                            row,
                            "thuTuMon"
                        )
                    ),

                dinhLuong:
                    toNumber(
                        getValue(
                            row,
                            "dinhLuong"
                        )
                    ),

                donViTinhId:
                    toNumber(
                        getValue(
                            row,
                            "donViTinhId"
                        )
                    ),

                maDonViTinh:
                    getValue(
                        row,
                        "maDonViTinh"
                    ),

                ghiChu:
                    getValue(
                        row,
                        "ghiChuMon"
                    ),

                active:
                    activeMon

            });

        }


        return Array.from(
            danhSach.values()
        );

    }

    async timThucDonImport(
        item
    ) {

        if (
            item.maThucDonLaKhoa
        ) {

            let theoId =
                null;

            let theoMa =
                null;


            if (
                item.id
            ) {

                theoId =
                    await thucDonRepository
                        .getChiTiet(
                            item.id
                        );


                if (!theoId) {

                    throw new ApiError(
                        400,
                        `Không tìm thấy thực đơn ID ${item.id}.`
                    );

                }

            }


            if (
                item.maThucDon
            ) {

                theoMa =
                    await thucDonRepository
                        .getChiTietByMa(
                            item.maThucDon
                        );

            }

            if (
                item.id &&
                item.maThucDon
            ) {

                if (
                    !theoMa ||
                    Number(
                        theoId.id
                    ) !==
                    Number(
                        theoMa.id
                    )
                ) {

                    throw new ApiError(
                        400,
                        `ID ${item.id} và mã "${item.maThucDon}" không khớp.`
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
                theoId
            ) {

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
                    true

            };

        }

        if (
            item.id
        ) {

            const theoId =
                await thucDonRepository
                    .getChiTiet(
                        item.id
                    );


            if (!theoId) {

                throw new ApiError(
                    400,
                    `Không tìm thấy thực đơn ID ${item.id}.`
                );

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
            !item.maThucDon
        ) {

            throw new ApiError(
                400,
                "Thêm mới thực đơn phải có mã thực đơn."
            );

        }


        const trungMa =
            await thucDonRepository
                .getChiTietByMa(
                    item.maThucDon
                );


        if (
            trungMa
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


            const data = {
                ...item
            };


            delete data.id;

            delete data.rowNumbers;

            delete data.maThucDonLaKhoa;

            if (
                xuLy.hanhDong ===
                "CAP_NHAT"
            ) {

                if (
                    !xuLy.choPhepCapNhatMa
                ) {

                    delete data.maThucDon;

                }

                delete data.trangThai;


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
                        item.rowNumbers

                });


                continue;

            }

            if (
                !data.maThucDon
            ) {

                throw new ApiError(
                    400,
                    "Thêm mới thực đơn phải có mã thực đơn."
                );

                    }

                data.trangThai =
                    10;


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
                        item.rowNumbers

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

        worksheet
            .getRow(
                HEADER_ROW
            )
            .getCell(
                resultColumn
            )
            .value =
            "ketQuaImport";

        worksheet
            .getRow(2)
            .getCell(
                resultColumn
            )
            .value =
            "Text";

        worksheet
            .getRow(4)
            .getCell(
                resultColumn
            )
            .value =
            "Kết quả import\nThành công hoặc lỗi";


        for (
            const item of
            ketQua
        ) {

            const noiDung =
                item.hanhDong ===
                    "THEM_MOI"
                    ?
                    `Thành công - Thêm mới - ID: ${item.id}`
                    :
                    `Thành công - Cập nhật - ID: ${item.id}`;


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
                            resultColumn
                        );


                cell.value =
                    `Lỗi - ${error.message}`;


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
            55;


        const buffer =
            await workbook.xlsx
                .writeBuffer();


        return {

            coLoi:
                errors.length > 0,

            fileName:
                `thuc_don_import_ket_qua_${Date.now()}.xlsx`,

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