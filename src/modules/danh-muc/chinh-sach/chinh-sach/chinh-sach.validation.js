const Joi = require("joi");

const { loaiChinhSach: danhSachLoaiChinhSach } = require("../../../../constants/enums");

const danhSachGiaTriLoaiChinhSach =
    danhSachLoaiChinhSach.map(
        item =>
            Number(item.value)
    );

const createSchema =
    Joi.object({

        maChinhSach:
            Joi.string()
                .trim()
                .max(50)
                .required()
                .messages({

                    "string.base":
                        "Mã chính sách phải là chuỗi.",

                    "string.empty":
                        "Mã chính sách không được để trống.",

                    "string.max":
                        "Mã chính sách không được vượt quá 50 ký tự.",

                    "any.required":
                        "Mã chính sách là bắt buộc."

                }),

        tenChinhSach:
            Joi.string()
                .trim()
                .max(255)
                .required()
                .messages({

                    "string.base":
                        "Tên chính sách phải là chuỗi.",

                    "string.empty":
                        "Tên chính sách không được để trống.",

                    "string.max":
                        "Tên chính sách không được vượt quá 255 ký tự.",

                    "any.required":
                        "Tên chính sách là bắt buộc."

                }),

        loaiChinhSach:
            Joi.number()
                .integer()
                .valid(
                    ...danhSachGiaTriLoaiChinhSach
                )
                .required()
                .messages({

                    "number.base":
                        "Loại chính sách phải là số.",

                    "number.integer":
                        "Loại chính sách phải là số nguyên.",

                    "any.only":
                        `Loại chính sách chỉ được là ${danhSachGiaTriLoaiChinhSach.join(", ")}.`,

                    "any.required":
                        "Loại chính sách là bắt buộc."

                }),

        voucherId:
            Joi.number()
                .integer()
                .positive()
                .required()
                .messages({

                    "number.base":
                        "Voucher phải là số.",

                    "number.integer":
                        "Voucher phải là số nguyên.",

                    "number.positive":
                        "Voucher phải có giá trị lớn hơn 0.",

                    "any.required":
                        "Voucher là bắt buộc."

                }),

        doiTuongIds:
            Joi.array()
                .items(

                    Joi.number()
                        .integer()
                        .positive()
                        .messages({

                            "number.base":
                                "ID đối tượng áp dụng phải là số.",

                            "number.integer":
                                "ID đối tượng áp dụng phải là số nguyên.",

                            "number.positive":
                                "ID đối tượng áp dụng phải lớn hơn 0."

                        })

                )
                .min(1)
                .unique()
                .required()
                .messages({

                    "array.base":
                        "Danh sách đối tượng áp dụng phải là một mảng.",

                    "array.min":
                        "Vui lòng chọn ít nhất một đối tượng áp dụng.",

                    "array.unique":
                        "Danh sách đối tượng áp dụng không được chứa ID trùng nhau.",

                    "any.required":
                        "Danh sách đối tượng áp dụng là bắt buộc."

                }),

        moTa:
            Joi.string()
                .trim()
                .max(1000)
                .allow(
                    "",
                    null
                )
                .optional()
                .messages({

                    "string.base":
                        "Mô tả phải là chuỗi.",

                    "string.max":
                        "Mô tả không được vượt quá 1000 ký tự."

                }),

        mucDoUuTien:
            Joi.number()
                .integer()
                .min(0)
                .required()
                .messages({

                    "number.base":
                        "Mức độ ưu tiên phải là số.",

                    "number.integer":
                        "Mức độ ưu tiên phải là số nguyên.",

                    "number.min":
                        "Mức độ ưu tiên không được nhỏ hơn 0.",

                    "any.required":
                        "Mức độ ưu tiên là bắt buộc."

                }),

        active:
            Joi.boolean()
                .optional()
                .messages({

                    "boolean.base":
                        "Trạng thái phải là true hoặc false."

                })

    });

const updateSchema =
    Joi.object({

        maChinhSach:
            Joi.string()
                .trim()
                .max(50)
                .optional()
                .messages({

                    "string.base":
                        "Mã chính sách phải là chuỗi.",

                    "string.empty":
                        "Mã chính sách không được để trống.",

                    "string.max":
                        "Mã chính sách không được vượt quá 50 ký tự."

                }),

        tenChinhSach:
            Joi.string()
                .trim()
                .max(255)
                .optional()
                .messages({

                    "string.base":
                        "Tên chính sách phải là chuỗi.",

                    "string.empty":
                        "Tên chính sách không được để trống.",

                    "string.max":
                        "Tên chính sách không được vượt quá 255 ký tự."

                }),

        loaiChinhSach:
            Joi.number()
                .integer()
                .valid(
                    ...danhSachGiaTriLoaiChinhSach
                )
                .optional()
                .messages({

                    "number.base":
                        "Loại chính sách phải là số.",

                    "number.integer":
                        "Loại chính sách phải là số nguyên.",

                    "any.only":
                        `Loại chính sách chỉ được là ${danhSachGiaTriLoaiChinhSach.join(", ")}.`

                }),

        voucherId:
            Joi.number()
                .integer()
                .positive()
                .optional()
                .messages({

                    "number.base":
                        "Voucher phải là số.",

                    "number.integer":
                        "Voucher phải là số nguyên.",

                    "number.positive":
                        "Voucher phải có giá trị lớn hơn 0."

                }),

        doiTuongIds:
            Joi.array()
                .items(

                    Joi.number()
                        .integer()
                        .positive()
                        .messages({

                            "number.base":
                                "ID đối tượng áp dụng phải là số.",

                            "number.integer":
                                "ID đối tượng áp dụng phải là số nguyên.",

                            "number.positive":
                                "ID đối tượng áp dụng phải lớn hơn 0."

                        })

                )
                .min(1)
                .unique()
                .optional()
                .messages({

                    "array.base":
                        "Danh sách đối tượng áp dụng phải là một mảng.",

                    "array.min":
                        "Vui lòng chọn ít nhất một đối tượng áp dụng.",

                    "array.unique":
                        "Danh sách đối tượng áp dụng không được chứa ID trùng nhau."

                }),

        moTa:
            Joi.string()
                .trim()
                .max(1000)
                .allow(
                    "",
                    null
                )
                .optional()
                .messages({

                    "string.base":
                        "Mô tả phải là chuỗi.",

                    "string.max":
                        "Mô tả không được vượt quá 1000 ký tự."

                }),

        mucDoUuTien:
            Joi.number()
                .integer()
                .min(0)
                .optional()
                .messages({

                    "number.base":
                        "Mức độ ưu tiên phải là số.",

                    "number.integer":
                        "Mức độ ưu tiên phải là số nguyên.",

                    "number.min":
                        "Mức độ ưu tiên không được nhỏ hơn 0."

                }),

        active:
            Joi.boolean()
                .optional()
                .messages({

                    "boolean.base":
                        "Trạng thái phải là true hoặc false."

                })

    })
        .min(1)
        .messages({

            "object.min":
                "Phải truyền ít nhất một trường cần cập nhật."

        });


module.exports = {

    createSchema,

    updateSchema

};