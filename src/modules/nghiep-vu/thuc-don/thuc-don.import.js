"use strict";

const ApiError = require("../../../utils/api-error");

const thucDonRepository = require("./thuc-don.repository");

const thucDonService = require("./thuc-don.service");

const { readExcel } = require("../../../helpers/excel/excel-reader");

const {
    toNumber,
    toBoolean
} = require("../../../helpers/excel/excel-value");

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require("../../../helpers/excel/import-strategy");

const {
    createResultFile,
    sendExcel
} = require("../../../helpers/excel/excel-result");

const { isTemplateValue } = require("../../../helpers/excel/excel-template");


const MA_BAO_CAO = "thuc_don";

const HEADER_ROW = 3;

const DATA_START_ROW = 5;


function validateHeaders(headerMap) {

    return validateKeyHeaders(
        headerMap,
        {
            idKey: "id/k",
            codeKey: "maThucDon/k",
            codeField: "maThucDon"
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

    const cauHinh =
        validateHeaders(
            headerMap
        );

    const fieldMa =
        cauHinh.hasCodeKey
            ? cauHinh.codeKey
            : cauHinh.codeField;

    const danhSach = [];


    for (
        let rowNumber = DATA_START_ROW;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {

        const row =
            worksheet.getRow(
                rowNumber
            );

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


        const idRaw =
            cauHinh.hasIdKey
                ? getValue(
                    row,
                    cauHinh.idKey
                )
                : undefined;

        const maThucDon = getValue(row, fieldMa);

        const tenThucDon = getValue(row, "tenThucDon");

        const loaiThucDon = getValue(row, "loaiThucDon");

        const tuNgay = getValue(row, "tuNgay");

        const denNgay = getValue(row, "denNgay");

        const maCoSo = getValue(row, "maCoSo");

        const maNhaAn = getValue(row, "maNhaAn");

        const maCaAn = getValue(row, "maCaAn");

        const trangThai = getValue(row, "trangThai");

        const moTa = getValue(row, "moTa");

        const activeRaw = getValue(row, "active");


        const item = {
            rowNumbers: [rowNumber],
            idIsKey: cauHinh.hasIdKey,
            codeIsKey: cauHinh.hasCodeKey,
            id: idRaw !== undefined ? toNumber(idRaw) : undefined,
            idRaw,
            code: maThucDon
        };

        if (tenThucDon !== undefined) {
            item.tenThucDon = tenThucDon;
        }

        if (loaiThucDon !== undefined) {
            item.loaiThucDon = toNumber(loaiThucDon);
        }

        if (tuNgay !== undefined) {
            item.tuNgay = tuNgay;
        }

        if (denNgay !== undefined) {
            item.denNgay = denNgay;
        }

        if (maCoSo !== undefined) {
            item.maCoSo = maCoSo;
        }

        if (maNhaAn !== undefined) {
            item.maNhaAn = maNhaAn;
        }

        if (maCaAn !== undefined) {
            item.maCaAn = maCaAn;
        }

        if (trangThai !== undefined) {
            item.trangThai = toNumber(trangThai);
        }

        if (moTa !== undefined) {
            item.moTa = moTa;
        }

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
            "ID thực đơn phải là số nguyên lớn hơn 0."
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
            "Thêm mới thực đơn phải có mã thực đơn."
        );

    }

    if (!item.tenThucDon) {

        throw new ApiError(
            400,
            "Thêm mới thực đơn phải có tên thực đơn."
        );

    }

    if (item.loaiThucDon === undefined) {

        throw new ApiError(
            400,
            "Thiếu thông tin loaiThucDon"
        );

    }

    if (!item.tuNgay) {

        throw new ApiError(
            400,
            "Thiếu thông tin tuNgay"
        );

    }

    if (!item.denNgay) {

        throw new ApiError(
            400,
            "Thiếu thông tin denNgay"
        );

    }

    if (!item.maCoSo) {

        throw new ApiError(
            400,
            "Thiếu thông tin maCoSo"
        );

    }

    if (!item.maCaAn) {

        throw new ApiError(
            400,
            "Thiếu thông tin maCaAn"
        );

    }

}


function taoDuLieuNghiepVu(item) {

    const data = {};

    if (item.tenThucDon !== undefined)
        data.tenThucDon = item.tenThucDon;

    if (item.loaiThucDon !== undefined)
        data.loaiThucDon = item.loaiThucDon;

    if (item.tuNgay !== undefined)
        data.tuNgay = item.tuNgay;

    if (item.denNgay !== undefined)
        data.denNgay = item.denNgay;

    if (item.maCoSo !== undefined)
        data.maCoSo = item.maCoSo;

    if (item.maNhaAn !== undefined)
        data.maNhaAn = item.maNhaAn;

    if (item.maCaAn !== undefined)
        data.maCaAn = item.maCaAn;

    if (item.trangThai !== undefined)
        data.trangThai = item.trangThai;

    if (item.moTa !== undefined)
        data.moTa = item.moTa;

    if (item.active !== undefined)
        data.active = item.active;

    return data;

}

async function timThucDonImport(item) {

    return await resolveImportStrategy(
        item,
        {
            getById: id =>
                thucDonRepository.getChiTiet(id),

            getByCode: ma =>
                thucDonRepository.getChiTietByMa(ma),

            getRecordId: record =>
                record.id,

            getRecordCode: record =>
                record.maThucDon,

            entityName: "thực đơn"
        }
    );

}


async function xuLyImport(file) {

    const {
        workbook,
        worksheet,
        danhSach
    } = await docDuLieuImport(
        file
    );


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

            const xuLy =
                await timThucDonImport(
                    item
                );

            const data =
                taoDuLieuNghiepVu(
                    item
                );


            if (xuLy.action === "UPDATE") {

                if (
                    xuLy.allowCodeChange &&
                    item.code !== undefined &&
                    shouldChangeCode(
                        item.code,
                        xuLy.record.maThucDon
                    )
                ) {

                    data.maThucDon =
                        item.code;

                }


                if (
                    Object.keys(data).length === 0
                ) {

                    throw new ApiError(
                        400,
                        "Không có dữ liệu cần cập nhật."
                    );

                }


                const result =
                    await thucDonService.update(
                        xuLy.record.id,
                        data
                    );


                successes.push({
                    rowNumbers: item.rowNumbers,
                    id: result.id,
                    maThucDon: result.maThucDon,
                    hanhDong: "CAP_NHAT",
                    message: `Cập nhật thành công - ID ${result.id}`
                });

                continue;

            }


            validateThemMoi(item);

            data.maThucDon =
                item.code;


            const result =
                await thucDonService.create(
                    data
                );


            successes.push({
                rowNumbers: item.rowNumbers,
                id: result.id,
                maThucDon: result.maThucDon,
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

        const result =
            await xuLyImport(
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
    timThucDonImport,
    taoDuLieuNghiepVu
};