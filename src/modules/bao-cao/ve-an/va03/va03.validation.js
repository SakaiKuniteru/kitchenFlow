'use strict';

const {
    enums,
    taoSchema,
    idArraySchema,
    enumArraySchema
} = require('../ve-an-report.helper');

const xemSchema = taoSchema({
    nhanVienIds: idArraySchema(),
    phongBanIds: idArraySchema(),

    /*
     * Giữ cả trạng thái hết hạn để không mất dữ liệu.
     * UI có thể chọn 10, 20, 30 hoặc 40.
     */
    trangThaiVe: enumArraySchema(enums.trangThaiVe)
});

module.exports = { xemSchema };