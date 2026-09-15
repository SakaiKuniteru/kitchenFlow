'use strict';

const {
    Joi,
    taoSchema,
    idArraySchema,
    trangThaiSchema
} = require(
    '../dat-mon-report.helper'
);


const HINH_THUC_DAT =
    Object.freeze({

        DAT_CHO_MINH:
            10,

        DAT_HO:
            20

    });


const DS_HINH_THUC_DAT =
    Object.values(
        HINH_THUC_DAT
    );


const xemSchema =
    taoSchema({

        /*
         * ==========================================
         * PHÒNG BAN
         * ==========================================
         */

        phongBanIds:
            idArraySchema(),


        /*
         * ==========================================
         * NHÂN VIÊN
         * ==========================================
         *
         * FE dùng:
         *
         * nhanVienIds
         *
         * BE sẽ lọc:
         *
         * nv_don_hang.nguoi_dat_id
         */

        nhanVienIds:
            idArraySchema(),


        /*
         * ==========================================
         * HÌNH THỨC ĐẶT
         * ==========================================
         *
         * 10 = Đặt cho mình
         * 20 = Đặt hộ
         */

        hinhThucDat:
            Joi
                .array()
                .items(
                    Joi
                        .number()
                        .integer()
                        .valid(
                            ...DS_HINH_THUC_DAT
                        )
                )
                .single()
                .unique()
                .default([]),


        /*
         * ==========================================
         * TRẠNG THÁI ĐƠN
         * ==========================================
         */

        trangThaiDon:
            trangThaiSchema()

    });


module.exports = {
    xemSchema,

    HINH_THUC_DAT,

    DS_HINH_THUC_DAT
};