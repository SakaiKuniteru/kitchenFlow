"use strict";

const ApiError = require("../../../../utils/api-error");
const khoRepository = require("./kho.repository");
const khoService = require("./kho.service");
const { readExcel } = require("../../../../helpers/excel/excel-reader");
const { toNumber, toBoolean } = require("../../../../helpers/excel/excel-value");
const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require("../../../../helpers/excel/import-strategy");
const {
    createResultFile,
    sendExcel
} = require("../../../../helpers/excel/excel-result");
const { isTemplateValue } = require("../../../../helpers/excel/excel-template");

const MA_BAO_CAO = "dm_kho";
const HEADER_ROW = 3;
const DATA_START_ROW = 5;

function validateHeaders(headerMap) {
    return validateKeyHeaders(
        headerMap,
        {
            idKey: "id/k",
            codeKey: "maKho/k",
            codeField: "maKho"
        }
    );
}

function dongLaTemplate(
    row,
    getValue,
    headerMap
) {
    for (const field of headerMap.keys()) {
        if (
            isTemplateValue(
                getValue(
                    row,
                    field
                )
            )
        ) {
            return true;
        }
    }

    return false;
}

async function docDuLieuImport(file) {
    const {
        workbook,
        worksheet,
        headerMap,
        getValue,
        hasData
    } = await readExcel(
        file,
        {
            headerRowNumber: HEADER_ROW
        }
    );

    const cauHinh = validateHeaders(headerMap);

    const fieldMa = cauHinh.hasCodeKey
        ? cauHinh.codeKey
        : cauHinh.codeField;

    const danhSach = [];

    for (
        let rowNumber = DATA_START_ROW;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {
        const row = worksheet.getRow(rowNumber);

        if (!hasData(row)) {
            continue;
        }

        if (
            dongLaTemplate(
                row,
                getValue,
                headerMap
            )
        ) {
            continue;
        }

        const idRaw = cauHinh.hasIdKey
            ? getValue(
                row,
                cauHinh.idKey
            )
            : undefined;

        const maKho = getValue(row, fieldMa);
        const tenKho = getValue(row, "tenKho");
        const nhaAnId = getValue(row, "nhaAnId");
        const maNhaAn = getValue(row, "maNhaAn");
        const loaiKho = getValue(row, "loaiKho");
        const diaDiem = getValue(row, "diaDiem");
        const nhietDoToiThieu = getValue(row, "nhietDoToiThieu");
        const nhietDoToiDa = getValue(row, "nhietDoToiDa");
        const moTa = getValue(row, "moTa");
        const activeRaw = getValue(row, "active");

        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maKho
        };

        if (tenKho !== undefined) {
            item.tenKho = tenKho;
        }

        if (nhaAnId !== undefined)
            item.nhaAnId = toNumber(nhaAnId);

        if (maNhaAn !== undefined)
            item.maNhaAn = maNhaAn;

        if (loaiKho !== undefined)
            item.loaiKho = toNumber(loaiKho);

        if (diaDiem !== undefined)
            item.diaDiem = diaDiem;

        if (nhietDoToiThieu !== undefined)
            item.nhietDoToiThieu = Number(nhietDoToiThieu);

        if (nhietDoToiDa !== undefined)
            item.nhietDoToiDa = Number(nhietDoToiDa);

        if (moTa !== undefined)
            item.moTa = moTa;

        if (activeRaw !== undefined) {
            try {
                item.active = toBoolean(activeRaw);
            } catch (error) {
                item.active = activeRaw;
            }
        }

        danhSach.push(item);
    }

    return {
        workbook,
        worksheet,
        danhSach
    };
}

function validateDongImport(item) {
    if (
        item.idRaw !== undefined &&
        (
            item.id === null ||
            !Number.isInteger(
                Number(item.id)
            ) ||
            Number(item.id) <= 0
        )
    ) {
        throw new ApiError(
            400,
            "ID Kho phải là số nguyên lớn hơn 0."
        );
    }

    if (
        item.active !== undefined &&
        typeof item.active !== "boolean"
    ) {
        throw new ApiError(
            400,
            "Trạng thái không hợp lệ. Chỉ chấp nhận TRUE hoặc FALSE."
        );
    }
}

function validateThemMoi(item) {
    if (!item.code) {
        throw new ApiError(
            400,
            "Thêm mới kho phải có mã kho."
        );
    }

    if (!item.tenKho) {
        throw new ApiError(
            400,
            "Thêm mới kho phải có tên kho."
        );
    }
}

function taoDuLieuNghiepVu(item) {
    const data = {};

    if (item.tenKho !== undefined)
        data.tenKho = item.tenKho;

    if (item.nhaAnId !== undefined)
        data.nhaAnId = item.nhaAnId;

    if (item.maNhaAn !== undefined)
        data.maNhaAn = item.maNhaAn;

    if (item.loaiKho !== undefined)
        data.loaiKho = item.loaiKho;

    if (item.diaDiem !== undefined)
        data.diaDiem = item.diaDiem;

    if (item.nhietDoToiThieu !== undefined)
        data.nhietDoToiThieu = item.nhietDoToiThieu;

    if (item.nhietDoToiDa !== undefined)
        data.nhietDoToiDa = item.nhietDoToiDa;

    if (item.moTa !== undefined)
        data.moTa = item.moTa;

    if (item.active !== undefined)
        data.active = item.active;

    return data;
}

async function timKhoImport(item) {
    return await resolveImportStrategy(
        item,
        {
            getById: id =>
                khoRepository.getChiTiet(id),

            getByCode: ma =>
                khoRepository.getChiTietByMa(ma),

            getRecordId: record =>
                record.id,

            getRecordCode: record =>
                record.maKho,

            entityName: "kho"
        }
    );
}

async function xuLyImport(file) {
    const {
        workbook,
        worksheet,
        danhSach
    } = await docDuLieuImport(file);

    if (danhSach.length === 0) {
        throw new ApiError(
            400,
            "File import không có dữ liệu."
        );
    }

    const successes = [];
    const errors = [];

    for (const item of danhSach) {
        try {
            validateDongImport(item);

            const xuLy = await timKhoImport(item);

            const data = taoDuLieuNghiepVu(item);

            if (xuLy.action === "UPDATE") {
                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(
                        item.code,
                        xuLy.record.maKho
                    )
                ) {
                    data.maKho = item.code;
                }

                if (
                    Object.keys(data).length === 0
                ) {
                    throw new ApiError(
                        400,
                        "Không có dữ liệu cần cập nhật."
                    );
                }

                const result = await khoService.update(
                    xuLy.record.id,
                    data
                );

                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maKho: result.maKho,
                    hanhDong: "CAP_NHAT",
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;
            }

            validateThemMoi(item);

            data.maKho = item.code;

            const result = await khoService.create(
                data
            );

            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maKho: result.maKho,
                hanhDong: "THEM_MOI",
                message: `Thêm mới thành công - ID ${result.id}`
            });
        } catch (error) {
            errors.push({
                rowNumbers: item.rowNumbers,
                message: error.message || "Dữ liệu không hợp lệ."
            });
        }
    }

    return await createResultFile(
        workbook,
        worksheet,
        {
            fileName: `${MA_BAO_CAO}.xlsx`,
            headerRowNumber: HEADER_ROW,
            successes,
            errors
        }
    );
}

async function importData(
    req,
    res,
    next
) {
    try {
        const result = await xuLyImport(
            req.file
        );

        return sendExcel(
            res,
            result
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    importData,
    xuLyImport,
    docDuLieuImport,
    timKhoImport,
    taoDuLieuNghiepVu
};