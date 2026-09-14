'use strict';

const Joi = require('joi');

const {
    trangThaiThanhToan:
        dsTrangThaiThanhToan
} = require(
    '../../../../constants/enums'
);


const NGUON_THANH_TOAN_TC02 = [
    10, // Vé ăn
    20  // Đơn hàng
];


const PHUONG_THUC_THANH_TOAN_TC02 = [
    10, // Tiền mặt
    20, // Chuyển khoản
    30, // QR Code
    40  // Thanh toán nội bộ
];


function getEnumValues(
    danhSach
) {
    return (
        danhSach ||
        []
    ).map(
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

        coSoIds:
            idArraySchema(),

        nhaAnIds:
            idArraySchema(),

        nguonThanhToan:
            Joi
                .array()
                .items(
                    Joi
                        .number()
                        .integer()
                        .valid(
                            ...NGUON_THANH_TOAN_TC02
                        )
                )
                .single()
                .default([]),

        hinhThucThanhToan:
            Joi
                .array()
                .items(
                    Joi
                        .number()
                        .integer()
                        .valid(
                            ...PHUONG_THUC_THANH_TOAN_TC02
                        )
                )
                .single()
                .default([]),

        trangThaiThanhToan:
            enumArraySchema(
                dsTrangThaiThanhToan
            ),

        thuNganIds:
            idArraySchema()

    })
        .unknown(
            false
        );


module.exports = {

    xemSchema,

    NGUON_THANH_TOAN_TC02,

    PHUONG_THUC_THANH_TOAN_TC02

};