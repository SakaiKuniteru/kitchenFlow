'use strict';

const Joi = require('joi');

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
    // Khoảng ngày ghi nhận dòng miễn giảm.
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

    chinhSachIds: idArraySchema(),

    // Không dùng một voucherIds chung cho hai bảng.
    voucherKeys: Joi.array()
        .items(
            Joi.string().pattern(/^(VA|DH):[1-9]\d*$/)
        )
        .single()
        .unique()
        .default([]),

    // Vé ăn: nhân viên lấy vé.
    // Đơn hàng: nhân viên đặt hàng.
    nhanVienIds: idArraySchema(),

    phongBanIds: idArraySchema()
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