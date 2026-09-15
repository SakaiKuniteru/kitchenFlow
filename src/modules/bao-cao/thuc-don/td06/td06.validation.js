'use strict';


const {
    taoSchema,
    idArraySchema,
    enumArraySchema,
    enums
} = require(
    '../thuc-don-report.helper'
);


const xemSchema =
    taoSchema({

        /*
         * ==========================================
         * LOẠI THỰC ĐƠN
         * ==========================================
         */

        loaiThucDon:
            enumArraySchema(
                enums.loaiThucDon
            ),


        /*
         * ==========================================
         * TRẠNG THÁI
         * ==========================================
         */

        trangThaiThucDon:
            enumArraySchema(
                enums.trangThaiThucDon
            ),


        /*
         * ==========================================
         * NGƯỜI LẬP
         * ==========================================
         *
         * Hiện DB nv_thuc_don chưa có cột này.
         * Giữ schema để FE/API ổn định.
         */

        nguoiLapIds:
            idArraySchema(),


        /*
         * ==========================================
         * NGƯỜI DUYỆT
         * ==========================================
         *
         * Hiện DB nv_thuc_don chưa có cột này.
         */

        nguoiDuyetIds:
            idArraySchema()

    });


module.exports = {
    xemSchema
};