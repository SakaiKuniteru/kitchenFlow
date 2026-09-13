'use strict';

const Joi = require('joi');

const {
    loaiThoiGian: dsLoaiThoiGian,
    doiTuongLayVe: dsDoiTuongLayVe,
    phuongThucThanhToan: dsPhuongThucThanhToan,
    trangThaiPhieuThu: dsTrangThaiPhieuThu,
    trangThaiVe: dsTrangThaiVe
} = require('../../../../constants/enums');

const LOAI_THOI_GIAN_TC03 = dsLoaiThoiGian
    .map(item => Number(item.value))
    .filter(value => value === 10);

// Không gồm 40: đã thanh toán,
// 50: đã hủy, 60: đã hoàn.
// -10 là lựa chọn tổng hợp của UI, không phải trạng thái một phiếu.
const TRANG_THAI_PHIEU_TC03 = dsTrangThaiPhieuThu
    .map(item => Number(item.value))
    .filter(value => [0, 10, 20, 30].includes(value));

function idArraySchema() {
    return Joi.array()
        .items(Joi.number().integer().positive())
        .single()
        .default([]);
}

function enumArraySchema(items) {
    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .valid(...items.map(item => Number(item.value)))
        )
        .single()
        .default([]);
}

const xemSchema = Joi.object({
    loaiThoiGian: Joi.number()
        .integer()
        .valid(...LOAI_THOI_GIAN_TC03)
        .required(),

    tuNgay: Joi.date()
        .iso()
        .required(),

    denNgay: Joi.date()
        .iso()
        .min(Joi.ref('tuNgay'))
        .required(),

    coSoIds: idArraySchema(),
    nhaAnIds: idArraySchema(),
    caAnIds: idArraySchema(),

    doiTuong: enumArraySchema(dsDoiTuongLayVe),

    // ID dm_tai_khoan.
    nguoiTaoIds: idArraySchema(),

    // ID dm_nhan_vien.
    nhanVienIds: idArraySchema(),

    hinhThucThanhToan: enumArraySchema(
        dsPhuongThucThanhToan
    ),

    trangThaiPhieuThu: Joi.array()
        .items(
            Joi.number()
                .integer()
                .valid(...TRANG_THAI_PHIEU_TC03)
        )
        .single()
        .default([]),

    trangThaiSuDung: enumArraySchema(dsTrangThaiVe)
}).unknown(false);

module.exports = {
    xemSchema,
    LOAI_THOI_GIAN_TC03,
    TRANG_THAI_PHIEU_TC03
};