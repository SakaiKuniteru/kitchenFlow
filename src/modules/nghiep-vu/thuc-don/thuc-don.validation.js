const Joi =
    require("joi");


/* =========================================================
   MÓN ĂN TRONG THỰC ĐƠN
   ========================================================= */

const monAnSchema =
    Joi.object({

        monAnId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID món ăn phải là số.",

                "number.integer":
                    "ID món ăn phải là số nguyên.",

                "number.positive":
                    "ID món ăn phải lớn hơn 0."

            }),

        maMonAn: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã món ăn phải là chuỗi.",

                "string.empty":
                    "Mã món ăn không được để trống.",

                "string.max":
                    "Mã món ăn không được vượt quá 50 ký tự."

            }),

        thuTuHienThi: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "Thứ tự hiển thị món ăn phải là số.",

                "number.integer":
                    "Thứ tự hiển thị món ăn phải là số nguyên.",

                "number.positive":
                    "Thứ tự hiển thị món ăn phải lớn hơn 0."

            }),

        dinhLuong: Joi.number()
            .precision(3)
            .min(0)
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "Định lượng phải là số.",

                "number.min":
                    "Định lượng không được nhỏ hơn 0."

            }),

        donViTinhId: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "ID đơn vị tính phải là số.",

                "number.integer":
                    "ID đơn vị tính phải là số nguyên.",

                "number.positive":
                    "ID đơn vị tính phải lớn hơn 0."

            }),

        maDonViTinh: Joi.string()
            .trim()
            .max(50)
            .allow(null)
            .optional()
            .messages({

                "string.base":
                    "Mã đơn vị tính phải là chuỗi.",

                "string.empty":
                    "Mã đơn vị tính không được để trống.",

                "string.max":
                    "Mã đơn vị tính không được vượt quá 50 ký tự."

            }),

        ghiChu: Joi.string()
            .trim()
            .max(500)
            .allow(
                "",
                null
            )
            .optional()
            .messages({

                "string.base":
                    "Ghi chú món ăn phải là chuỗi.",

                "string.max":
                    "Ghi chú món ăn không được vượt quá 500 ký tự."

            }),

        active: Joi.boolean()
            .optional()
            .messages({

                "boolean.base":
                    "Trạng thái món ăn trong thực đơn phải là true hoặc false."

            })

    })
        .or(
            "monAnId",
            "maMonAn"
        )
        .messages({

            "object.missing":
                "Phải truyền monAnId hoặc maMonAn."

        });


/* =========================================================
   NHÓM MÓN ĂN TRONG NGÀY
   ========================================================= */

const nhomMonAnSchema =
    Joi.object({

        nhomMonAnId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID nhóm món ăn phải là số.",

                "number.integer":
                    "ID nhóm món ăn phải là số nguyên.",

                "number.positive":
                    "ID nhóm món ăn phải lớn hơn 0."

            }),

        maNhomMonAn: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã nhóm món ăn phải là chuỗi.",

                "string.empty":
                    "Mã nhóm món ăn không được để trống.",

                "string.max":
                    "Mã nhóm món ăn không được vượt quá 50 ký tự."

            }),

        thuTuHienThi: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "Thứ tự hiển thị nhóm món ăn phải là số.",

                "number.integer":
                    "Thứ tự hiển thị nhóm món ăn phải là số nguyên.",

                "number.positive":
                    "Thứ tự hiển thị nhóm món ăn phải lớn hơn 0."

            }),

        ghiChu: Joi.string()
            .trim()
            .max(500)
            .allow(
                "",
                null
            )
            .optional()
            .messages({

                "string.base":
                    "Ghi chú nhóm món ăn phải là chuỗi.",

                "string.max":
                    "Ghi chú nhóm món ăn không được vượt quá 500 ký tự."

            }),

        active: Joi.boolean()
            .optional()
            .messages({

                "boolean.base":
                    "Trạng thái nhóm món ăn trong thực đơn phải là true hoặc false."

            }),

        dsMonAn: Joi.array()
            .items(
                monAnSchema
            )
            .optional()
            .messages({

                "array.base":
                    "Danh sách món ăn phải là một danh sách."

            })

    })
        .or(
            "nhomMonAnId",
            "maNhomMonAn"
        )
        .messages({

            "object.missing":
                "Phải truyền nhomMonAnId hoặc maNhomMonAn."

        });


/* =========================================================
   NGÀY THỰC ĐƠN
   ========================================================= */

const ngaySchema =
    Joi.object({

        ngay: Joi.date()
            .iso()
            .required()
            .messages({

                "date.base":
                    "Ngày thực đơn không hợp lệ.",

                "date.format":
                    "Ngày thực đơn phải có định dạng YYYY-MM-DD.",

                "any.required":
                    "Ngày thực đơn là bắt buộc."

            }),

        ghiChu: Joi.string()
            .trim()
            .max(500)
            .allow(
                "",
                null
            )
            .optional()
            .messages({

                "string.base":
                    "Ghi chú ngày thực đơn phải là chuỗi.",

                "string.max":
                    "Ghi chú ngày thực đơn không được vượt quá 500 ký tự."

            }),

        active: Joi.boolean()
            .optional()
            .messages({

                "boolean.base":
                    "Trạng thái ngày thực đơn phải là true hoặc false."

            }),

        dsNhomMonAn: Joi.array()
            .items(
                nhomMonAnSchema
            )
            .optional()
            .messages({

                "array.base":
                    "Danh sách nhóm món ăn phải là một danh sách."

            })

    });


/* =========================================================
   CREATE
   ========================================================= */

const createSchema =
    Joi.object({

        maThucDon: Joi.string()
            .trim()
            .max(50)
            .required()
            .messages({

                "string.base":
                    "Mã thực đơn phải là chuỗi.",

                "string.empty":
                    "Mã thực đơn không được để trống.",

                "string.max":
                    "Mã thực đơn không được vượt quá 50 ký tự.",

                "any.required":
                    "Mã thực đơn là bắt buộc."

            }),

        tenThucDon: Joi.string()
            .trim()
            .max(255)
            .required()
            .messages({

                "string.base":
                    "Tên thực đơn phải là chuỗi.",

                "string.empty":
                    "Tên thực đơn không được để trống.",

                "string.max":
                    "Tên thực đơn không được vượt quá 255 ký tự.",

                "any.required":
                    "Tên thực đơn là bắt buộc."

            }),

        loaiThucDon: Joi.number()
            .integer()
            .valid(
                10,
                20,
                30,
                40
            )
            .required()
            .messages({

                "number.base":
                    "Loại thực đơn phải là số.",

                "number.integer":
                    "Loại thực đơn phải là số nguyên.",

                "any.only":
                    "Loại thực đơn không hợp lệ.",

                "any.required":
                    "Loại thực đơn là bắt buộc."

            }),

        tuNgay: Joi.date()
            .iso()
            .required()
            .messages({

                "date.base":
                    "Từ ngày không hợp lệ.",

                "date.format":
                    "Từ ngày phải có định dạng YYYY-MM-DD.",

                "any.required":
                    "Từ ngày là bắt buộc."

            }),

        denNgay: Joi.date()
            .iso()
            .min(
                Joi.ref(
                    "tuNgay"
                )
            )
            .required()
            .messages({

                "date.base":
                    "Đến ngày không hợp lệ.",

                "date.format":
                    "Đến ngày phải có định dạng YYYY-MM-DD.",

                "date.min":
                    "Đến ngày phải lớn hơn hoặc bằng từ ngày.",

                "any.required":
                    "Đến ngày là bắt buộc."

            }),


        /* =====================================================
           CƠ SỞ
           ===================================================== */

        coSoId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID cơ sở phải là số.",

                "number.integer":
                    "ID cơ sở phải là số nguyên.",

                "number.positive":
                    "ID cơ sở phải lớn hơn 0."

            }),

        maCoSo: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã cơ sở phải là chuỗi.",

                "string.empty":
                    "Mã cơ sở không được để trống.",

                "string.max":
                    "Mã cơ sở không được vượt quá 50 ký tự."

            }),


        /* =====================================================
           NHÀ ĂN
           ===================================================== */

        nhaAnId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID nhà ăn phải là số.",

                "number.integer":
                    "ID nhà ăn phải là số nguyên.",

                "number.positive":
                    "ID nhà ăn phải lớn hơn 0."

            }),

        maNhaAn: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã nhà ăn phải là chuỗi.",

                "string.empty":
                    "Mã nhà ăn không được để trống.",

                "string.max":
                    "Mã nhà ăn không được vượt quá 50 ký tự."

            }),


        /* =====================================================
           CA ĂN
           ===================================================== */

        caAnId: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "ID ca ăn phải là số.",

                "number.integer":
                    "ID ca ăn phải là số nguyên.",

                "number.positive":
                    "ID ca ăn phải lớn hơn 0."

            }),

        maCaAn: Joi.string()
            .trim()
            .max(50)
            .allow(null)
            .optional()
            .messages({

                "string.base":
                    "Mã ca ăn phải là chuỗi.",

                "string.empty":
                    "Mã ca ăn không được để trống.",

                "string.max":
                    "Mã ca ăn không được vượt quá 50 ký tự."

            }),


        trangThai: Joi.number()
            .integer()
            .valid(
                10,
                20,
                30,
                40
            )
            .optional()
            .default(10)
            .messages({

                "number.base":
                    "Trạng thái thực đơn phải là số.",

                "number.integer":
                    "Trạng thái thực đơn phải là số nguyên.",

                "any.only":
                    "Trạng thái thực đơn không hợp lệ."

            }),

        moTa: Joi.string()
            .trim()
            .max(500)
            .allow(
                "",
                null
            )
            .optional()
            .messages({

                "string.base":
                    "Mô tả phải là chuỗi.",

                "string.max":
                    "Mô tả không được vượt quá 500 ký tự."

            }),

        active: Joi.boolean()
            .optional()
            .messages({

                "boolean.base":
                    "Trạng thái hoạt động phải là true hoặc false."

            }),

        dsNgay: Joi.array()
            .items(
                ngaySchema
            )
            .min(1)
            .required()
            .messages({

                "array.base":
                    "Danh sách ngày thực đơn phải là một danh sách.",

                "array.min":
                    "Danh sách ngày thực đơn không được để trống.",

                "any.required":
                    "Danh sách ngày thực đơn là bắt buộc."

            })

    })
        .or(
            "coSoId",
            "maCoSo"
        )
        .or(
            "nhaAnId",
            "maNhaAn"
        )
        .custom(
            (
                value,
                helpers
            ) => {

                /*
                 * Loại 10 = Theo ngày.
                 */

                if (
                    Number(
                        value.loaiThucDon
                    ) === 10
                ) {

                    const tuNgay =
                        new Date(
                            value.tuNgay
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            );

                    const denNgay =
                        new Date(
                            value.denNgay
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            );

                    if (
                        tuNgay !==
                        denNgay
                    ) {

                        return helpers.error(
                            "thucDon.ngayKhongHopLe"
                        );

                    }

                }


                const tuNgay =
                    new Date(
                        value.tuNgay
                    )
                        .toISOString()
                        .slice(
                            0,
                            10
                        );

                const denNgay =
                    new Date(
                        value.denNgay
                    )
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


                for (
                    const itemNgay of
                    value.dsNgay || []
                ) {

                    const ngay =
                        new Date(
                            itemNgay.ngay
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            );


                    if (
                        ngay <
                            tuNgay ||
                        ngay >
                            denNgay
                    ) {

                        return helpers.error(
                            "thucDon.ngayNgoaiKhoang"
                        );

                    }

                }


                return value;

            }
        )
        .messages({

            "object.missing":
                "Phải truyền ID hoặc mã tương ứng của cơ sở và nhà ăn.",

            "thucDon.ngayKhongHopLe":
                "Thực đơn theo ngày phải có từ ngày và đến ngày giống nhau.",

            "thucDon.ngayNgoaiKhoang":
                "Ngày trong danh sách thực đơn phải nằm trong khoảng từ ngày đến ngày."

        });


/* =========================================================
   UPDATE
   ========================================================= */

const updateSchema =
    Joi.object({

        maThucDon: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã thực đơn phải là chuỗi.",

                "string.empty":
                    "Mã thực đơn không được để trống.",

                "string.max":
                    "Mã thực đơn không được vượt quá 50 ký tự."

            }),

        tenThucDon: Joi.string()
            .trim()
            .max(255)
            .optional()
            .messages({

                "string.base":
                    "Tên thực đơn phải là chuỗi.",

                "string.empty":
                    "Tên thực đơn không được để trống.",

                "string.max":
                    "Tên thực đơn không được vượt quá 255 ký tự."

            }),

        loaiThucDon: Joi.number()
            .integer()
            .valid(
                10,
                20,
                30,
                40
            )
            .optional()
            .messages({

                "number.base":
                    "Loại thực đơn phải là số.",

                "number.integer":
                    "Loại thực đơn phải là số nguyên.",

                "any.only":
                    "Loại thực đơn không hợp lệ."

            }),

        tuNgay: Joi.date()
            .iso()
            .optional()
            .messages({

                "date.base":
                    "Từ ngày không hợp lệ.",

                "date.format":
                    "Từ ngày phải có định dạng YYYY-MM-DD."

            }),

        denNgay: Joi.date()
            .iso()
            .optional()
            .messages({

                "date.base":
                    "Đến ngày không hợp lệ.",

                "date.format":
                    "Đến ngày phải có định dạng YYYY-MM-DD."

            }),


        /* =====================================================
           CƠ SỞ
           ===================================================== */

        coSoId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID cơ sở phải là số.",

                "number.integer":
                    "ID cơ sở phải là số nguyên.",

                "number.positive":
                    "ID cơ sở phải lớn hơn 0."

            }),

        maCoSo: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã cơ sở phải là chuỗi.",

                "string.empty":
                    "Mã cơ sở không được để trống.",

                "string.max":
                    "Mã cơ sở không được vượt quá 50 ký tự."

            }),


        /* =====================================================
           NHÀ ĂN
           ===================================================== */

        nhaAnId: Joi.number()
            .integer()
            .positive()
            .optional()
            .messages({

                "number.base":
                    "ID nhà ăn phải là số.",

                "number.integer":
                    "ID nhà ăn phải là số nguyên.",

                "number.positive":
                    "ID nhà ăn phải lớn hơn 0."

            }),

        maNhaAn: Joi.string()
            .trim()
            .max(50)
            .optional()
            .messages({

                "string.base":
                    "Mã nhà ăn phải là chuỗi.",

                "string.empty":
                    "Mã nhà ăn không được để trống.",

                "string.max":
                    "Mã nhà ăn không được vượt quá 50 ký tự."

            }),

        caAnId: Joi.number()
            .integer()
            .positive()
            .allow(null)
            .optional()
            .messages({

                "number.base":
                    "ID ca ăn phải là số.",

                "number.integer":
                    "ID ca ăn phải là số nguyên.",

                "number.positive":
                    "ID ca ăn phải lớn hơn 0."

            }),

        maCaAn: Joi.string()
            .trim()
            .max(50)
            .allow(null)
            .optional()
            .messages({

                "string.base":
                    "Mã ca ăn phải là chuỗi.",

                "string.empty":
                    "Mã ca ăn không được để trống.",

                "string.max":
                    "Mã ca ăn không được vượt quá 50 ký tự."

            }),


        moTa: Joi.string()
            .trim()
            .max(500)
            .allow(
                "",
                null
            )
            .optional()
            .messages({

                "string.base":
                    "Mô tả phải là chuỗi.",

                "string.max":
                    "Mô tả không được vượt quá 500 ký tự."

            }),

        active: Joi.boolean()
            .optional()
            .messages({

                "boolean.base":
                    "Trạng thái hoạt động phải là true hoặc false."

            }),

        dsNgay: Joi.array()
            .items(
                ngaySchema
            )
            .min(1)
            .optional()
            .messages({

                "array.base":
                    "Danh sách ngày thực đơn phải là một danh sách.",

                "array.min":
                    "Danh sách ngày thực đơn không được để trống."

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