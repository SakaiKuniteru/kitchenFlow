'use strict';

const {
    Joi,
    enums,
    taoSchema,
    idArraySchema,
    enumArraySchema
} = require('../ve-an-report.helper');

const TRANG_THAI_PHIEU = enums.trangThaiPhieuThu.filter(
    item => Number(item.value) !== -10
);

const xemSchema = taoSchema({
    loaiThoiGian: Joi.string()
        .valid('NGAY_TAO', 'NGAY_SU_DUNG')
        .default('NGAY_SU_DUNG'),

    maVe: Joi.string()
        .trim()
        .max(150)
        .allow('')
        .default(''),

    soPhieu: Joi.string()
        .trim()
        .max(150)
        .allow('')
        .default(''),

    nhanVienIds: idArraySchema(),
    phongBanIds: idArraySchema(),

    trangThaiVe: enumArraySchema(enums.trangThaiVe),

    /*
     * Trạng thái PHIẾU:
     * 40 = đã thanh toán.
     *
     * Không dùng enum trạng thái GIAO DỊCH,
     * nơi 30 mới là thành công.
     */
    trangThaiThanhToan: enumArraySchema(TRANG_THAI_PHIEU)
});

module.exports = { xemSchema };