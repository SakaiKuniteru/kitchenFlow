'use strict';

const {
    enums,
    taoSchema,
    enumArraySchema
} = require('../ve-an-report.helper');

const xemSchema = taoSchema({
    loaiVe: enumArraySchema(enums.doiTuongLayVe),

    trangThaiVe: enumArraySchema(enums.trangThaiVe)
});

module.exports = { xemSchema };