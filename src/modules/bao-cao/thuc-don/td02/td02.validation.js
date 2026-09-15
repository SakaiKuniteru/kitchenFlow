'use strict';


const {
    taoSchema,
    idArraySchema
} = require(
    '../thuc-don-report.helper'
);


const xemSchema =
    taoSchema({

        /*
         * ==========================================
         * THỰC ĐƠN
         * ==========================================
         */

        thucDonIds:
            idArraySchema(),


        /*
         * ==========================================
         * NHÓM MÓN
         * ==========================================
         */

        nhomMonAnIds:
            idArraySchema(),


        /*
         * ==========================================
         * MÓN ĂN
         * ==========================================
         */

        monAnIds:
            idArraySchema()

    });


module.exports = {
    xemSchema
};