'use strict';

const Joi = require('joi');

const {
    phuongThucThanhToan: dsPhuongThucVeAn,
    phuongThucThanhToanDonHang: dsPhuongThucDonHang
} = require('../../../../constants/enums');

const PHUONG_THUC_VALUES = [
    ...new Set(
        [
            ...dsPhuongThucVeAn,
            ...dsPhuongThucDonHang
        ].map(item => Number(item.value))
    )
];

function idArraySchema() {
    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .max(Number.MAX_SAFE_INTEGER)
        )
        .single()
        .unique()
        .default([]);
}

const xemSchema = Joi.object({
    // Khoảng thời gian giao dịch thu thành công.
    tuNgay: Joi.date().iso().required(),

    denNgay: Joi.date()
        .iso()
        .min(Joi.ref('tuNgay'))
        .required(),

    nguon: Joi.array()
        .items(Joi.string().valid('VA', 'DH'))
        .single()
        .unique()
        .min(1)
        .default(['VA', 'DH']),

    coSoIds: idArraySchema(),
    nhaAnIds: idArraySchema(),

    // ID dm_tai_khoan, không phải dm_nhan_vien.
    nguoiThuIds: idArraySchema(),

    hinhThucThanhToan: Joi.array()
        .items(
            Joi.number()
                .integer()
                .valid(...PHUONG_THUC_VALUES)
        )
        .single()
        .unique()
        .default([])
})
    .unknown(false)
    .custom((value, helpers) => {
        if (
            value.nhaAnIds.length > 0 &&
            value.nguon.includes('DH')
        ) {
            return helpers.message({
                custom:
                    'Chưa xác định được nhà ăn của đơn hàng. '
                    + 'Khi lọc nhà ăn, hãy chọn riêng nguồn VA.'
            });
        }

        return value;
    });

module.exports = { xemSchema };