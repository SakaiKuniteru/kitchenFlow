const Joi = require("joi");

const loginSchema = Joi.object({

    username: Joi.string()
        .trim()
        .allow(""),

    password: Joi.string()
        .allow("")


})
.custom((value, helpers) => {


    // cả username và password đều trống
    if (
        !value.username &&
        !value.password
    ) {

        return helpers.message(
            "Tên đăng nhập và mật khẩu không được để trống."
        );

    }


    // chỉ username trống
    if (!value.username) {

        return helpers.message(
            "Tên đăng nhập không được để trống."
        );

    }


    // chỉ password trống
    if (!value.password) {

        return helpers.message(
            "Mật khẩu không được để trống."
        );

    }


    return value;


});

const refreshTokenSchema = Joi.object({

    refreshToken: Joi.string()
        .required()
        .messages({

            "string.empty":
                "Refresh Token không được để trống.",

            "any.required":
                "Refresh Token là bắt buộc."

        })

});

const changePasswordSchema = Joi.object({

    oldPassword: Joi.string()
        .required()
        .messages({

            "string.empty":
                "Mật khẩu cũ không được để trống.",

            "any.required":
                "Mật khẩu cũ là bắt buộc."

        }),

    newPassword: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).+$/
        )
        .required()
        .messages({

            "string.empty":
                "Mật khẩu mới không được để trống.",

            "string.min":
                "Mật khẩu mới phải có ít nhất 8 ký tự.",

            "string.pattern.base":
                "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.",

            "any.required":
                "Mật khẩu mới là bắt buộc."

        })

});

module.exports = {

    loginSchema,

    refreshTokenSchema,

    changePasswordSchema

};