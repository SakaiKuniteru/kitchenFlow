const fs = require("fs");

const os = require("os");

const path = require("path");

const crypto = require("crypto");

const XLSX = require("xlsx");

const ExcelJS = require("exceljs");

const pool = require("../../../../config/database");

const { loaiDonVi: dsLoaiDonVi } = require("../../../../constants/enums");

const ApiError = require("../../../../utils/api-error");

const donViTinhRepository = require("./don-vi-tinh.repository");

const baoCaoRepository = require("../../he-thong/bao-cao/bao-cao.repository");


const MA_BAO_CAO = "dm_don_vi_tinh";

const TEN_VUNG_DU_LIEU = "dmDonViTinh";


class DonViTinhService {

    parseId(id) {

        const donViTinhId =
            Number(id);

        if (
            !Number.isInteger(donViTinhId) ||
            donViTinhId <= 0
        ) {

            throw new ApiError(
                400,
                "ID đơn vị tính không hợp lệ."
            );

        }

        return donViTinhId;

    }


    async getTongHop(query) {

        return await donViTinhRepository
            .getTongHop(query);

    }


    async getChiTiet(id) {

        const donViTinhId =
            this.parseId(id);

        const donViTinh =
            await donViTinhRepository
                .getChiTiet(
                    donViTinhId
                );

        if (!donViTinh) {

            throw new ApiError(
                404,
                "Đơn vị tính không tồn tại."
            );

        }

        return donViTinh;

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await donViTinhRepository
                .existsMaDonViTinh(
                    data.maDonViTinh,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã đơn vị tính đã tồn tại."
            );

        }

        const trungTen =
            await donViTinhRepository
                .existsTenDonViTinh(
                    data.tenDonViTinh,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên đơn vị tính đã tồn tại."
            );

        }

    }


    validateLoaiDonVi(
        loaiDonVi
    ) {

        const hopLe =
            dsLoaiDonVi.some(
                item =>
                    Number(item.value) ===
                    Number(loaiDonVi)
            );

        if (!hopLe) {

            throw new ApiError(
                400,
                "Loại đơn vị không hợp lệ."
            );

        }

    }


    async create(data) {

        const duLieu = {
            ...data
        };

        await this.validateTrungDuLieu(
            duLieu
        );

        this.validateLoaiDonVi(
            duLieu.loaiDonVi
        );

        const duLieuTao = {

            maDonViTinh:
                duLieu.maDonViTinh.trim(),

            tenDonViTinh:
                duLieu.tenDonViTinh.trim(),

            kyHieu:
                duLieu.kyHieu?.trim() || null,

            loaiDonVi:
                Number(
                    duLieu.loaiDonVi
                ),

            active:
                duLieu.active !== undefined
                    ? duLieu.active
                    : true

        };

        return await donViTinhRepository
            .create(
                duLieuTao
            );

    }


    async update(
        id,
        data
    ) {

        const donViTinhId =
            this.parseId(id);

        const donViTinh =
            await donViTinhRepository
                .getChiTiet(
                    donViTinhId
                );

        if (!donViTinh) {

            throw new ApiError(
                404,
                "Đơn vị tính không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maDonViTinh:
                data.maDonViTinh !== undefined
                    ? data.maDonViTinh.trim()
                    : donViTinh.maDonViTinh,

            tenDonViTinh:
                data.tenDonViTinh !== undefined
                    ? data.tenDonViTinh.trim()
                    : donViTinh.tenDonViTinh,

            kyHieu:
                data.kyHieu !== undefined
                    ? (
                        data.kyHieu === null
                            ? null
                            : data.kyHieu.trim() || null
                    )
                    : donViTinh.kyHieu,

            loaiDonVi:
                data.loaiDonVi !== undefined
                    ? Number(data.loaiDonVi)
                    : Number(donViTinh.loaiDonVi),

            active:
                data.active !== undefined
                    ? data.active
                    : donViTinh.active

        };

        await this.validateTrungDuLieu(
            duLieuCapNhat,
            donViTinhId
        );

        this.validateLoaiDonVi(
            duLieuCapNhat.loaiDonVi
        );

        const ketQua =
            await donViTinhRepository
                .update(
                    donViTinhId,
                    duLieuCapNhat
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Đơn vị tính không tồn tại."
            );

        }

        return ketQua;

    }


    async getCauHinhBaoCao() {

        const baoCao =
            await baoCaoRepository
                .getChiTietByMa(
                    MA_BAO_CAO
                );

        if (!baoCao) {

            throw new ApiError(
                404,
                `Không tìm thấy cấu hình báo cáo: ${MA_BAO_CAO}.`
            );

        }

        if (!baoCao.active) {

            throw new ApiError(
                400,
                "Báo cáo đơn vị tính đã bị khóa."
            );

        }

        if (!baoCao.fileMau) {

            throw new ApiError(
                400,
                "Báo cáo đơn vị tính chưa có file mẫu."
            );

        }

        const duongDanFile =
            path.join(
                process.cwd(),
                "src",
                "public",
                baoCao.fileMau
            );

        if (
            !fs.existsSync(
                duongDanFile
            )
        ) {

            throw new ApiError(
                404,
                "Không tìm thấy file mẫu báo cáo đơn vị tính."
            );

        }

        return {
            baoCao,
            duongDanFile
        };

    }

    timDongKeyExcelJS(
        worksheet
    ) {

        for (
            let rowNumber = 1;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {

            const row =
                worksheet.getRow(
                    rowNumber
                );

            const columns = [];

            row.eachCell(
                {
                    includeEmpty: true
                },
                (
                    cell,
                    columnNumber
                ) => {

                    const value =
                        cell.value;

                    const text =
                        value === null ||
                        value === undefined
                            ? ""
                            : String(value)
                                .trim();

                    const field =
                        this.layTenFieldTuKey(
                            text
                        );

                    if (field) {

                        columns.push({

                            columnNumber,

                            field

                        });

                    }

                }
            );

            if (
                columns.length > 0
            ) {

                return {

                    rowNumber,

                    columns

                };

            }

        }

        throw new ApiError(
            400,
            `File mẫu không chứa key [[${TEN_VUNG_DU_LIEU}.*]].`
        );

    }

    cloneExcelValue(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        return JSON.parse(
            JSON.stringify(value)
        );

    }
    
    layTenFieldTuKey(
        giaTri
    ) {

        if (
            typeof giaTri !== "string"
        ) {
            return null;
        }

        const regex =
            new RegExp(
                `^\\[\\[${TEN_VUNG_DU_LIEU}\\.([a-zA-Z0-9_]+)\\]\\]$`
            );

        const match =
            giaTri.trim().match(
                regex
            );

        return match
            ? match[1]
            : null;

    }


    async exportData() {

        const {
            baoCao,
            duongDanFile
        } = await this.getCauHinhBaoCao();

        const danhSach =
            await donViTinhRepository
                .getTongHop();

        const workbook =
            new ExcelJS.Workbook();

        try {

            await workbook.xlsx.readFile(
                duongDanFile
            );

        } catch (error) {

            console.error(
                "Lỗi đọc file mẫu:",
                {
                    duongDanFile,
                    message:
                        error.message
                }
            );

            throw new ApiError(
                400,
                "Không thể đọc file mẫu Excel. Hãy tạo file mẫu bằng ExcelJS hoặc lưu lại bằng Microsoft Excel dưới định dạng .xlsx."
            );

        }

        const worksheet =
            workbook.worksheets[0];

        if (!worksheet) {

            throw new ApiError(
                400,
                "File mẫu không có sheet dữ liệu."
            );

        }

        const thongTinKey =
            this.timDongKeyExcelJS(
                worksheet
            );

        const {
            rowNumber: dongKey,
            columns: danhSachCot
        } = thongTinKey;

        if (
            danhSachCot.length === 0
        ) {

            throw new ApiError(
                400,
                "Không tìm thấy cột key trong file mẫu."
            );

        }

        const dongMau =
            worksheet.getRow(
                dongKey
            );

        const chieuCaoDongMau =
            dongMau.height;

        const styleTheoCot = {};

        for (
            const cot of danhSachCot
        ) {

            const cell =
                dongMau.getCell(
                    cot.columnNumber
                );

            styleTheoCot[cot.columnNumber] = {

                style:
                    this.cloneExcelValue(
                        cell.style
                    ),

                numFmt:
                    cell.numFmt,

                alignment:
                    this.cloneExcelValue(
                        cell.alignment
                    ),

                border:
                    this.cloneExcelValue(
                        cell.border
                    ),

                fill:
                    this.cloneExcelValue(
                        cell.fill
                    ),

                font:
                    this.cloneExcelValue(
                        cell.font
                    ),

                protection:
                    this.cloneExcelValue(
                        cell.protection
                    )

            };

        }

        const soDongCanXoa =
            Math.max(
                worksheet.rowCount -
                    dongKey +
                    1,
                1
            );

        worksheet.spliceRows(
            dongKey,
            soDongCanXoa
        );

        /*
        * Thêm lại đúng số dòng dữ liệu.
        */
        danhSach.forEach(
            (
                item,
                index
            ) => {

                const rowNumber =
                    dongKey + index;

                worksheet.insertRow(
                    rowNumber,
                    []
                );

                const row =
                    worksheet.getRow(
                        rowNumber
                    );

                row.height =
                    chieuCaoDongMau;

                for (
                    const cot of danhSachCot
                ) {

                    const cell =
                        row.getCell(
                            cot.columnNumber
                        );

                    const cauHinh =
                        styleTheoCot[
                            cot.columnNumber
                        ];

                    if (cauHinh) {

                        cell.style =
                            this.cloneExcelValue(
                                cauHinh.style
                            );

                        cell.numFmt =
                            cauHinh.numFmt;

                        cell.alignment =
                            this.cloneExcelValue(
                                cauHinh.alignment
                            );

                        cell.border =
                            this.cloneExcelValue(
                                cauHinh.border
                            );

                        cell.fill =
                            this.cloneExcelValue(
                                cauHinh.fill
                            );

                        cell.font =
                            this.cloneExcelValue(
                                cauHinh.font
                            );

                        cell.protection =
                            this.cloneExcelValue(
                                cauHinh.protection
                            );

                    }

                    let value =
                        item[cot.field];

                    if (
                        cot.field ===
                        "loaiDonVi"
                    ) {

                        value =
                            value !== null &&
                            value !== undefined
                                ? Number(value)
                                : null;

                    }

                    if (
                        cot.field ===
                        "active"
                    ) {

                        value =
                            Boolean(value);

                    }

                    cell.value =
                        value ?? null;

                }

                row.commit();

            }
        );

        const extensionXuat =
            ".xlsx";

        const tenFileTam =
            `${crypto.randomUUID()}${extensionXuat}`;

        const duongDanTam =
            path.join(
                os.tmpdir(),
                tenFileTam
            );

        await workbook.xlsx.writeFile(
            duongDanTam
        );

        return {

                path:
                    duongDanTam,

                fileName:
                    `${baoCao.maBaoCao}.xlsx`,

                contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

            };

    }

    chuyenGiaTriBoolean(
        value
    ) {

        /*
        * Để trống thì mặc định TRUE.
        */
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return {
                value: true,
                error: null
            };

        }

        if (
            value === true ||
            value === false
        ) {

            return {
                value,
                error: null
            };

        }

        const normalized =
            String(value)
                .trim()
                .toLowerCase();

        if (
            [
                "true",
                "1",
                "t",
                "yes",
                "có"
            ].includes(normalized)
        ) {

            return {
                value: true,
                error: null
            };

        }

        if (
            [
                "false",
                "0",
                "f",
                "no",
                "không"
            ].includes(normalized)
        ) {

            return {
                value: false,
                error: null
            };

        }

        return {
            value: null,
            error:
                "Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE."
        };

    }


    async docDuLieuImport(
        file
    ) {

        if (!file) {

            throw new ApiError(
                400,
                "File import là bắt buộc."
            );

        }

        const workbook =
            new ExcelJS.Workbook();

        try {

            await workbook.xlsx.load(
                file.buffer
            );

        } catch (error) {

            throw new ApiError(
                400,
                "Không thể đọc file import Excel."
            );

        }

        const worksheet =
            workbook.worksheets[0];

        if (!worksheet) {

            throw new ApiError(
                400,
                "File import không có sheet dữ liệu."
            );

        }

        /*
        * Dòng 3 là dòng field.
        */
        const headerRow =
            worksheet.getRow(3);

        const headers = [];

        for (
            let columnNumber = 1;
            columnNumber <= 6;
            columnNumber++
        ) {

            headers.push(
                String(
                    headerRow.getCell(
                        columnNumber
                    ).value ?? ""
                ).trim()
            );

        }

        const hasField =
            field =>
                headers.includes(
                    field
                );

        const DS_FIELD_HOP_LE = [

            "id/k",

            "maDonViTinh/k",

            "tenDonViTinh",

            "kyHieu",

            "loaiDonVi",

            "active"

        ];

        const headersCoDuLieu =
            headers.filter(
                header => header
            );

        for (
            const header of headersCoDuLieu
        ) {

            if (
                !DS_FIELD_HOP_LE.includes(
                    header
                )
            ) {

                throw new ApiError(
                    400,
                    `File import có field không hợp lệ: ${header}.`
                );

            }

        }

        const coKhoaId =
            headers.includes(
                "id/k"
            );

        const coKhoaMa =
            headers.includes(
                "maDonViTinh/k"
            );

        if (
            !coKhoaId &&
            !coKhoaMa
        ) {

            throw new ApiError(
                400,
                "File import phải có ít nhất một khóa id/k hoặc maDonViTinh/k."
            );

        }

        const dsFieldCapNhat = [

            "tenDonViTinh",

            "kyHieu",

            "loaiDonVi",

            "active"

        ];

        const coFieldCapNhat =
            dsFieldCapNhat.some(
                field =>
                    headers.includes(
                        field
                    )
            );

        if (!coFieldCapNhat) {

            throw new ApiError(
                400,
                "File import không có trường dữ liệu cần cập nhật."
            );

        }

        const danhSach = [];

        /*
        * Dữ liệu bắt đầu từ dòng 5.
        */
        for (
            let rowNumber = 5;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {

            const row =
                worksheet.getRow(
                    rowNumber
                );

            const values = [];

            for (
                let columnNumber = 1;
                columnNumber <= 6;
                columnNumber++
            ) {

                values.push(
                    row.getCell(
                        columnNumber
                    ).value
                );

            }

            const coDuLieu =
                values.some(
                    value =>
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                );

            if (!coDuLieu) {
                continue;
            }

            const coTemplateKey =
                values.some(
                    value =>
                        typeof value === "string" &&
                        value.includes("[[")
                );

            if (coTemplateKey) {
                continue;
            }

            const rawData = {};

            headers.forEach(
                (
                    header,
                    index
                ) => {

                    rawData[header] =
                        values[index];

                }
            );

            const errors = [];

            let id = null;

            if (
                rawData["id/k"] !== null &&
                rawData["id/k"] !== undefined &&
                String(
                    rawData["id/k"]
                ).trim() !== ""
            ) {

                id =
                    Number(
                        rawData["id/k"]
                    );

                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {

                    errors.push(
                        "ID không hợp lệ."
                    );

                }

            }

            const maDonViTinh =
                rawData["maDonViTinh/k"] !== null &&
                rawData["maDonViTinh/k"] !== undefined
                    ? String(
                        rawData["maDonViTinh/k"]
                    ).trim()
                    : "";

            const tenDonViTinh =
                hasField(
                    "tenDonViTinh"
                )
                    ? (
                        rawData.tenDonViTinh !== null &&
                        rawData.tenDonViTinh !== undefined
                            ? String(
                                rawData.tenDonViTinh
                            ).trim()
                            : ""
                    )
                    : undefined;

            const kyHieu =
                hasField(
                    "kyHieu"
                )
                    ? (
                        rawData.kyHieu !== null &&
                        rawData.kyHieu !== undefined
                            ? String(
                                rawData.kyHieu
                            ).trim() || null
                            : null
                    )
                    : undefined;

            let loaiDonVi =
                undefined;

            if (
                hasField(
                    "loaiDonVi"
                )
            ) {

                if (
                    rawData.loaiDonVi !== null &&
                    rawData.loaiDonVi !== undefined &&
                    String(
                        rawData.loaiDonVi
                    ).trim() !== ""
                ) {

                    loaiDonVi =
                        Number(
                            rawData.loaiDonVi
                        );

                } else {

                    loaiDonVi =
                        null;

                }

            }

            let active =
                undefined;

            if (
                hasField(
                    "active"
                )
            ) {

                const ketQuaBoolean =
                    this.chuyenGiaTriBoolean(
                        rawData.active
                    );

                active =
                    ketQuaBoolean.value;

                if (
                    ketQuaBoolean.error &&
                    !errors.includes(
                        ketQuaBoolean.error
                    )
                ) {

                    errors.push(
                        ketQuaBoolean.error
                    );

                }

            }

            danhSach.push({

                dongExcel:
                    rowNumber,

                id,

                maDonViTinh,

                tenDonViTinh,

                kyHieu,

                loaiDonVi,

                active,

                fields: {

                    tenDonViTinh:
                        hasField(
                            "tenDonViTinh"
                        ),

                    kyHieu:
                        hasField(
                            "kyHieu"
                        ),

                    loaiDonVi:
                        hasField(
                            "loaiDonVi"
                        ),

                    active:
                        hasField(
                            "active"
                        )

                },

                errors,

                hanhDong:
                    null,

                banGhi:
                    null

            });

        }

        if (
            danhSach.length === 0
        ) {

            throw new ApiError(
                400,
                "File import không có dữ liệu."
            );

        }

        return {

            workbook,

            worksheet,

            danhSach

        };

    }


    validateDongImport(
        item
    ) {

        const errors = [];

        if (
            item.id === null &&
            !item.maDonViTinh
        ) {

            errors.push(
                "Phải có ID hoặc mã đơn vị tính."
            );

        }

        if (
            item.maDonViTinh &&
            item.maDonViTinh.length > 50
        ) {

            errors.push(
                "Mã đơn vị tính không được vượt quá 50 ký tự."
            );

        }

        /*
        * Chỉ kiểm tra tên khi file có cột tenDonViTinh.
        */
        if (
            item.fields.tenDonViTinh
        ) {

            if (
                !item.tenDonViTinh
            ) {

                errors.push(
                    "Tên đơn vị tính không được để trống."
                );

            } else if (
                item.tenDonViTinh.length > 100
            ) {

                errors.push(
                    "Tên đơn vị tính không được vượt quá 100 ký tự."
                );

            }

        }

        /*
        * Chỉ kiểm tra ký hiệu khi file có cột kyHieu.
        */
        if (
            item.fields.kyHieu &&
            item.kyHieu &&
            item.kyHieu.length > 20
        ) {

            errors.push(
                "Ký hiệu không được vượt quá 20 ký tự."
            );

        }

        /*
        * Chỉ kiểm tra loại đơn vị khi file có cột loaiDonVi.
        */
        if (
            item.fields.loaiDonVi
        ) {

            const loaiDonViHopLe =
                dsLoaiDonVi.some(
                    enumItem =>
                        Number(
                            enumItem.value
                        ) ===
                        Number(
                            item.loaiDonVi
                        )
                );

            if (!loaiDonViHopLe) {

                errors.push(
                    "Loại đơn vị không hợp lệ. Chỉ chấp nhận 10, 20 hoặc 30."
                );

            }

        }

        return errors;

    }

    taoCotKetQuaImport(
        worksheet
    ) {

        const cotTrangThai = 8;
        const cotKetQua = 9;

        worksheet.getCell(
            4,
            cotTrangThai
        ).value =
            "Trạng thái";

        worksheet.getCell(
            4,
            cotKetQua
        ).value =
            "Kết quả";

        for (
            const columnNumber of [
                cotTrangThai,
                cotKetQua
            ]
        ) {

            const cell =
                worksheet.getCell(
                    4,
                    columnNumber
                );

            cell.font = {

                bold: true,

                color: {
                    argb: "FF2563EB"
                }

            };

            cell.alignment = {

                vertical: "top",

                wrapText: true

            };

            cell.border = {

                top: {
                    style: "thin"
                },

                left: {
                    style: "thin"
                },

                bottom: {
                    style: "thin"
                },

                right: {
                    style: "thin"
                }

            };

        }

        worksheet.getColumn(
            cotTrangThai
        ).width = 18;

        worksheet.getColumn(
            cotKetQua
        ).width = 55;

        return {

            cotTrangThai,

            cotKetQua

        };

    }

    ghiKetQuaImport(
        worksheet,
        item,
        cotTrangThai,
        cotKetQua
    ) {

        const cellTrangThai =
            worksheet.getCell(
                item.dongExcel,
                cotTrangThai
            );

        const cellKetQua =
            worksheet.getCell(
                item.dongExcel,
                cotKetQua
            );

        if (
            item.errors.length > 0
        ) {

            cellTrangThai.value =
                "Lỗi";

            cellKetQua.value =
                item.errors.join(
                    "\n"
                );

            cellTrangThai.font = {

                bold: true,

                color: {
                    argb: "FFFF0000"
                }

            };

            cellKetQua.font = {

                color: {
                    argb: "FFFF0000"
                }

            };

            cellTrangThai.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: {
                    argb: "FFFFE5E5"
                }

            };

            cellKetQua.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: {
                    argb: "FFFFE5E5"
                }

            };

        } else {

            cellTrangThai.value =
                item.hanhDong;

            cellKetQua.value =
                "Thành công";

            cellTrangThai.font = {

                bold: true,

                color: {
                    argb: "FF008000"
                }

            };

            cellKetQua.font = {

                color: {
                    argb: "FF008000"
                }

            };

            cellTrangThai.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: {
                    argb: "FFE2F0D9"
                }

            };

            cellKetQua.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: {
                    argb: "FFE2F0D9"
                }

            };

        }

        for (
            const cell of [
                cellTrangThai,
                cellKetQua
            ]
        ) {

            cell.alignment = {

                vertical: "top",

                wrapText: true

            };

            cell.border = {

                top: {
                    style: "thin"
                },

                left: {
                    style: "thin"
                },

                bottom: {
                    style: "thin"
                },

                right: {
                    style: "thin"
                }

            };

        }

    }

    async importData(
        file
    ) {

        const {

            workbook,

            worksheet,

            danhSach

        } = await this.docDuLieuImport(
            file
        );

        const client =
            await pool.connect();

        let daBatDauTransaction =
            false;

        try {

            await client.query(
                "BEGIN"
            );

            daBatDauTransaction =
                true;

            /*
            * Giai đoạn 1:
            * kiểm tra toàn bộ dữ liệu,
            * chưa ghi DB.
            */
            for (
                const item of danhSach
            ) {

                item.errors.push(
                    ...this.validateDongImport(
                        item
                    )
                );

                if (
                    item.errors.length > 0
                ) {
                    continue;
                }

                const theoId =
                    item.id !== null
                        ? await donViTinhRepository
                            .getByIdForImport(
                                client,
                                item.id
                            )
                        : null;

                const theoMa =
                    item.maDonViTinh
                        ? await donViTinhRepository
                            .getByMaForImport(
                                client,
                                item.maDonViTinh
                            )
                        : null;

                /*
                * Có cả ID và mã.
                */
                if (
                    item.id !== null &&
                    item.maDonViTinh
                ) {

                    if (
                        !theoId &&
                        !theoMa
                    ) {

                        item.errors.push(
                            "Không tìm thấy bản ghi theo ID và mã đơn vị tính."
                        );

                        continue;

                    }

                    if (!theoId) {

                        item.errors.push(
                            `Không tìm thấy đơn vị tính có ID ${item.id}.`
                        );

                        continue;

                    }

                    if (!theoMa) {

                        item.errors.push(
                            `Không tìm thấy đơn vị tính có mã ${item.maDonViTinh}.`
                        );

                        continue;

                    }

                    if (
                        Number(theoId.id) !==
                        Number(theoMa.id)
                    ) {

                        item.errors.push(
                            "ID và mã đơn vị tính không khớp nhau."
                        );

                        continue;

                    }

                    item.hanhDong =
                        "Cập nhật";

                    item.banGhi =
                        theoId;

                    continue;

                }

                /*
                * Chỉ có ID.
                */
                if (
                    item.id !== null
                ) {

                    if (!theoId) {

                        item.errors.push(
                            `Không tìm thấy đơn vị tính có ID ${item.id}.`
                        );

                        continue;

                    }

                    item.hanhDong =
                        "Cập nhật";

                    item.banGhi =
                        theoId;

                    continue;

                }

                /*
                * Chỉ có mã.
                */
                if (theoMa) {

                    item.hanhDong =
                        "Cập nhật";

                    item.banGhi =
                        theoMa;

                } else {

                    item.hanhDong =
                        "Thêm mới";

                    item.banGhi =
                        null;

                    if (
                        !item.maDonViTinh
                    ) {

                        item.errors.push(
                            "Thêm mới bắt buộc phải có mã đơn vị tính."
                        );

                    }

                    if (
                        !item.fields.tenDonViTinh ||
                        !item.tenDonViTinh
                    ) {

                        item.errors.push(
                            "Thêm mới bắt buộc phải có tên đơn vị tính."
                        );

                    }

                    if (
                        !item.fields.loaiDonVi ||
                        ![10, 20, 30].includes(
                            Number(
                                item.loaiDonVi
                            )
                        )
                    ) {

                        item.errors.push(
                            "Thêm mới bắt buộc phải có loại đơn vị hợp lệ."
                        );

                    }

                    if (
                        !item.fields.active
                    ) {

                        item.active =
                            true;

                    }

                }

            }

            const coLoi =
                danhSach.some(
                    item =>
                        item.errors.length > 0
                );

            /*
            * Có bất kỳ lỗi nào:
            * rollback toàn bộ,
            * không ghi DB.
            */
            if (coLoi) {

                await client.query(
                    "ROLLBACK"
                );

                daBatDauTransaction =
                    false;

            } else {

                /*
                * Giai đoạn 2:
                * tất cả đều hợp lệ mới ghi DB.
                */
                for (
                    const item of danhSach
                ) {

                    if (
                        item.hanhDong ===
                        "Cập nhật"
                    ) {

                        await donViTinhRepository
                            .updateImport(
                                client,
                                item.banGhi.id,
                                item
                            );

                    } else {

                        const idMoi =
                            await donViTinhRepository
                                .createImport(
                                    client,
                                    item
                                );

                        item.id =
                            idMoi;

                    }

                }

                await client.query(
                    "COMMIT"
                );

                daBatDauTransaction =
                    false;

            }

            const {

                cotTrangThai,

                cotKetQua

            } = this.taoCotKetQuaImport(
                worksheet
            );

            for (
                const item of danhSach
            ) {

                this.ghiKetQuaImport(

                    worksheet,

                    item,

                    cotTrangThai,

                    cotKetQua

                );

            }

            const tenFileTam =
                `${crypto.randomUUID()}.xlsx`;

            const duongDanTam =
                path.join(
                    os.tmpdir(),
                    tenFileTam
                );

            await workbook.xlsx.writeFile(
                duongDanTam
            );

            return {

                path:
                    duongDanTam,

                fileName:
                    coLoi
                        ? "dm_don_vi_tinh_import_loi.xlsx"
                        : "dm_don_vi_tinh_import_thanh_cong.xlsx",

                contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                coLoi,

                tongSoDong:
                    danhSach.length,

                soDongLoi:
                    danhSach.filter(
                        item =>
                            item.errors.length > 0
                    ).length,

                soDongCapNhat:
                    danhSach.filter(
                        item =>
                            item.hanhDong ===
                                "Cập nhật" &&
                            item.errors.length === 0
                    ).length,

                soDongThemMoi:
                    danhSach.filter(
                        item =>
                            item.hanhDong ===
                                "Thêm mới" &&
                            item.errors.length === 0
                    ).length

            };

        } catch (error) {

            if (
                daBatDauTransaction
            ) {

                await client.query(
                    "ROLLBACK"
                );

            }

            throw error;

        } finally {

            client.release();

        }

    }

}


module.exports =
    new DonViTinhService();