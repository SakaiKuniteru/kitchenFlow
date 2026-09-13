'use strict';

const Joi =
    require(
        'joi'
    );


const {
    loaiThoiGian:
        dsLoaiThoiGian,

    doiTuongLayVe:
        dsDoiTuongLayVe,

    phuongThucThanhToan:
        dsPhuongThucThanhToan,

    thuChi:
        dsThuChi,

    trangThaiThanhToan:
        dsTrangThaiThanhToan,

    trangThaiVe:
        dsTrangThaiVe

} = require(
    '../../../../constants/enums'
);


const LOAI_THOI_GIAN_TC01 =
    dsLoaiThoiGian
        .map(
            item =>
                Number(
                    item.value
                )
        )
        .filter(
            value =>
                [
                    10,
                    30,
                    40
                ].includes(
                    value
                )
        );


function getEnumValues(
    danhSach = []
) {
    return danhSach.map(
        item =>
            Number(
                item.value
            )
    );
}


function idArraySchema() {
    return Joi
        .array()
        .items(
            Joi
                .number()
                .integer()
                .positive()
        )
        .single()
        .default([]);
}


function enumArraySchema(
    danhSach
) {
    return Joi
        .array()
        .items(
            Joi
                .number()
                .integer()
                .valid(
                    ...getEnumValues(
                        danhSach
                    )
                )
        )
        .single()
        .default([]);
}


const xemSchema =
    Joi.object({

        /*
         * ==============================
         * THỜI GIAN
         * ==============================
         */

        loaiThoiGian:
            Joi
                .number()
                .integer()
                .valid(
                    ...LOAI_THOI_GIAN_TC01
                )
                .required(),

        tuNgay:
            Joi
                .date()
                .iso()
                .required(),

        denNgay:
            Joi
                .date()
                .iso()
                .min(
                    Joi.ref(
                        'tuNgay'
                    )
                )
                .required(),


        /*
         * ==============================
         * TỔ CHỨC
         * ==============================
         */

        coSoIds:
            idArraySchema(),

        nhaAnIds:
            idArraySchema(),

        caAnIds:
            idArraySchema(),


        /*
         * ==============================
         * ĐỐI TƯỢNG
         * ==============================
         */

        doiTuong:
            enumArraySchema(
                dsDoiTuongLayVe
            ),


        /*
         * ==============================
         * TÀI KHOẢN
         * ==============================
         *
         * Đây là ID dm_tai_khoan.
         */

        nguoiTaoIds:
            idArraySchema(),

        thuNganIds:
            idArraySchema(),


        /*
         * ==============================
         * THANH TOÁN
         * ==============================
         */

        hinhThucThanhToan:
            enumArraySchema(
                dsPhuongThucThanhToan
            ),

        hienThiThuChi:
            enumArraySchema(
                dsThuChi
            ),

        trangThaiThanhToan:
            enumArraySchema(
                dsTrangThaiThanhToan
            ),


        /*
         * ==============================
         * SỬ DỤNG VÉ
         * ==============================
         */

        trangThaiSuDung:
            enumArraySchema(
                dsTrangThaiVe
            )

    })
        .unknown(
            false
        );


module.exports = {
    xemSchema,
    LOAI_THOI_GIAN_TC01
};