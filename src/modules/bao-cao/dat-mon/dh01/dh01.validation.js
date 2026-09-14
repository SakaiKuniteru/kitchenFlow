'use strict';

const {
    enums,
    taoSchema,
    loaiThoiGianSchema,
    trangThaiSchema,
    enumArraySchema
} = require('../dat-mon-report.helper');

const xemSchema = taoSchema({
    loaiThoiGian: loaiThoiGianSchema(),

    trangThaiDon: trangThaiSchema(),

    phuongThucThanhToan: enumArraySchema(
        enums.phuongThucThanhToanDonHang
    ),

    trangThaiThanhToan: enumArraySchema(
        enums.trangThaiThanhToanDonHang
    )
});

module.exports = { xemSchema };