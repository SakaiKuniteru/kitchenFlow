'use strict';

const {
    enums,
    taoSchema,
    idArraySchema,
    enumArraySchema
} = require('../ve-an-report.helper');

const xemSchema = taoSchema({
    phongBanIds: idArraySchema(),

    loaiVe: enumArraySchema(enums.doiTuongLayVe)
});

module.exports = { xemSchema };