'use strict';


const {
    Joi,
    taoSchema,
    idArraySchema
} = require(
    '../thuc-don-report.helper'
);


const xemSchema =
    taoSchema({

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
            idArraySchema(),


        /*
         * ==========================================
         * SỐ LẦN XUẤT HIỆN TỐI THIỂU
         * ==========================================
         *
         * Mặc định = 2
         * vì báo cáo dùng để phát hiện món lặp.
         */

        soLanXuatHienToiThieu:
            Joi
                .number()
                .integer()
                .min(
                    1
                )
                .default(
                    2
                )

    });


module.exports = {
    xemSchema
};