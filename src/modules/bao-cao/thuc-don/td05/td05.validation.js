'use strict';


const {
    taoSchema,
    idArraySchema,
    enumArraySchema,
    enums
} = require('../thuc-don-report.helper');


const xemSchema = taoSchema({

        dotBinhChonIds: idArraySchema(),
        trangThaiDotBinhChon: enumArraySchema(enums.trangThaiTaoBinhChon)
    });

module.exports = { xemSchema };