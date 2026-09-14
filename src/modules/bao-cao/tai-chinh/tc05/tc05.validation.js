'use strict';

const Joi = require('joi');


/*
 * Mã phương thức chuẩn riêng
 * cho báo cáo TC05.
 *
 * Không phải raw code của từng nghiệp vụ.
 */
const PHUONG_THUC_THANH_TOAN_TC05 = [
    10,
    20,
    30,
    40
];


function idArraySchema() {

    return Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .max(
                    Number.MAX_SAFE_INTEGER
                )
        )
        .single()
        .unique()
        .default([]);
}


const xemSchema =
    Joi.object({

        /*
         * Khoảng thời gian
         * giao dịch thu thành công.
         */
        tuNgay:
            Joi.date()
                .iso()
                .required(),


        denNgay:
            Joi.date()
                .iso()
                .min(
                    Joi.ref(
                        'tuNgay'
                    )
                )
                .required(),


        /*
         * VA = Vé ăn
         * DH = Đơn hàng
         */
        nguon:
            Joi.array()
                .items(
                    Joi.string()
                        .valid(
                            'VA',
                            'DH'
                        )
                )
                .single()
                .unique()
                .min(1)
                .default([
                    'VA',
                    'DH'
                ]),


        coSoIds:
            idArraySchema(),


        nhaAnIds:
            idArraySchema(),


        /*
         * ID dm_tai_khoan.
         */
        nguoiThuIds:
            idArraySchema(),


        /*
         * Mã chuẩn TC05:
         *
         * 10 = Tiền mặt
         * 20 = Chuyển khoản
         * 30 = QR Code
         * 40 = Thanh toán nội bộ
         */
        hinhThucThanhToan:
            Joi.array()
                .items(
                    Joi.number()
                        .integer()
                        .valid(
                            ...PHUONG_THUC_THANH_TOAN_TC05
                        )
                )
                .single()
                .unique()
                .default([])

    })
        .unknown(
            false
        )
        .custom(
            (
                value,
                helpers
            ) => {

                /*
                 * Đơn hàng chưa có nha_an_id.
                 */
                if (
                    value
                        .nhaAnIds
                        .length >
                        0 &&
                    value
                        .nguon
                        .includes(
                            'DH'
                        )
                ) {

                    return helpers
                        .message({
                            custom:
                                'Chưa xác định được nhà ăn của đơn hàng. '
                                + 'Khi lọc nhà ăn, hãy chọn riêng nguồn VA.'
                        });

                }


                return value;
            }
        );


module.exports = {
    xemSchema
};