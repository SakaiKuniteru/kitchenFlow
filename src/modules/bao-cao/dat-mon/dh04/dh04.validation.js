'use strict';

const {
    enums,
    TRANG_THAI_DANG_XU_LY,
    taoSchema,
    enumArraySchema,
    idArraySchema
} = require('../dat-mon-report.helper');

const dsTrangThai = enums.trangThaiDonHang.filter(
    item => TRANG_THAI_DANG_XU_LY.includes(
        Number(item.value)
    )
);

const xemSchema = taoSchema({
    khungGioNhanIds: idArraySchema(),
    diaDiemNhanIds: idArraySchema(),

    // ID dm_nhan_vien, theo nguoi_xu_ly_id của đơn hàng.
    nguoiXuLyIds: idArraySchema(),

    trangThaiDon: enumArraySchema(dsTrangThai)
        .min(1)
        .default([...TRANG_THAI_DANG_XU_LY])
}).custom((value, helpers) => {
    if (value.tuNgay !== value.denNgay) {
        return helpers.message({
            custom:
                'DH04 là báo cáo theo một ngày nhận. '
                + 'tuNgay và denNgay phải bằng nhau.'
        });
    }

    return value;
});

module.exports = { xemSchema };