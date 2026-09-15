'use strict';

const {
    Joi,
    S,
    enums,
    taoSchema,
    idArraySchema,
    enumArraySchema
} = require(
    '../dat-mon-report.helper'
);


const DS_LOAI_XU_LY =
    enums.trangThaiDonHang
        .filter(
            item =>
                [
                    Number(
                        S.DA_HUY
                    ),

                    Number(
                        S.TU_CHOI
                    )
                ]
                    .includes(
                        Number(
                            item.value
                        )
                    )
        );


const xemSchema =
    taoSchema({

        /*
         * ==========================================
         * NGƯỜI ĐẶT
         * ==========================================
         */

        nguoiDatIds:
            idArraySchema(),


        /*
         * ==========================================
         * NGƯỜI THỰC HIỆN HỦY / TỪ CHỐI
         * ==========================================
         *
         * nv_don_hang.nguoi_huy_id
         */

        nguoiThucHienIds:
            idArraySchema(),


        /*
         * ==========================================
         * HỦY / TỪ CHỐI
         * ==========================================
         *
         * Giá trị chính là trạng thái đơn hàng:
         *
         * S.DA_HUY
         * S.TU_CHOI
         */

        loaiXuLy:
            enumArraySchema(
                DS_LOAI_XU_LY
            )
                .min(
                    1
                )
                .default([
                    S.DA_HUY,
                    S.TU_CHOI
                ]),


        /*
         * ==========================================
         * LÝ DO
         * ==========================================
         */

        lyDo:
            Joi
                .string()
                .trim()
                .max(
                    500
                )
                .allow(
                    ''
                )
                .default(
                    ''
                )

    });


module.exports = {
    xemSchema,
    DS_LOAI_XU_LY
};