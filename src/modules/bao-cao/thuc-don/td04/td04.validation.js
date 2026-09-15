'use strict';


const {
    Joi,
    taoSchema,
    idArraySchema
} = require(
    '../thuc-don-report.helper'
);


const NGUON_SO_SUAT =
    Object.freeze({

        DU_KIEN:
            10,

        DANG_KY:
            20

    });


const DS_NGUON_SO_SUAT =
    Object.values(
        NGUON_SO_SUAT
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
         * MÓN ĂN
         * ==========================================
         */

        monAnIds:
            idArraySchema(),


        /*
         * ==========================================
         * THỰC PHẨM
         * ==========================================
         */

        thucPhamIds:
            idArraySchema(),


        /*
         * ==========================================
         * NGUỒN SỐ SUẤT
         * ==========================================
         *
         * 10 = Dự kiến
         *      số lượt bình chọn Có
         *
         * 20 = Đăng ký
         *      số lượng vé đã đăng ký
         */

        nguonSoSuat:
            Joi
                .array()
                .items(
                    Joi
                        .number()
                        .integer()
                        .valid(
                            ...DS_NGUON_SO_SUAT
                        )
                )
                .single()
                .unique()
                .min(
                    1
                )
                .default([
                    NGUON_SO_SUAT
                        .DU_KIEN,

                    NGUON_SO_SUAT
                        .DANG_KY
                ])

    });


module.exports = {
    xemSchema,
    NGUON_SO_SUAT,
    DS_NGUON_SO_SUAT
};