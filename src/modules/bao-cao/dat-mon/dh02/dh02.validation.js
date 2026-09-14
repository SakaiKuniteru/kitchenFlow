'use strict';

const {
    Joi,
    taoSchema,
    loaiThoiGianSchema,
    trangThaiSchema,
    idArraySchema
} = require('../dat-mon-report.helper');

const xemSchema = taoSchema({
    loaiThoiGian: loaiThoiGianSchema(),

    maDon: Joi.string()
        .trim()
        .max(150)
        .allow('')
        .default(''),

    // Hai trường này là ID dm_nhan_vien.
    nguoiDatIds: idArraySchema(),
    nguoiNhanIds: idArraySchema(),

    // Người nhận ngoài hệ thống có thể không có ID.
    tenNguoiNhan: Joi.string()
        .trim()
        .max(255)
        .allow('')
        .default(''),

    phongBanIds: idArraySchema(),

    trangThaiDon: trangThaiSchema()
});

module.exports = { xemSchema };