'use strict';

const {
    Joi,
    taoSchema,
    idArraySchema
} = require('../ve-an-report.helper');

const xemSchema = taoSchema({
    // ID dm_nhan_vien: nhân viên lấy vé.
    nhanVienIds: idArraySchema(),

    // ID dm_tai_khoan: tài khoản thực hiện hủy.
    nguoiHuyIds: idArraySchema(),

    // Tìm chuỗi nằm trong lý do hủy.
    lyDoHuy: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .default('')
});

module.exports = { xemSchema };