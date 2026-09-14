'use strict';

const {
    S,
    taoSchema,
    trangThaiSchema,
    idArraySchema
} = require('../dat-mon-report.helper');

const xemSchema = taoSchema({
    nhomSanPhamIds: idArraySchema(),
    sanPhamIds: idArraySchema(),
    khungGioNhanIds: idArraySchema(),

    trangThaiDon: trangThaiSchema()
        .min(1)
        .default([
            S.CHO_XAC_NHAN,
            S.DANG_CHUAN_BI,
            S.SAN_SANG_GIAO,
            S.DANG_GIAO,
            S.HOAN_THANH,
            S.DONG_DON
        ])
});

module.exports = { xemSchema };