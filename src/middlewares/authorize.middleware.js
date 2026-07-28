const ApiError = require("../utils/api-error");

function authorize(...roles) {

    return (req, res, next) => {

        const user = req.user;

        if (!user) {

            return next(
                new ApiError(
                    401,
                    "Chưa đăng nhập."
                )
            );

        }

        const hasRole = user.roles.some(
            role => roles.includes(role)
        );

        if (!hasRole) {

            return next(
                new ApiError(
                    403,
                    "Bạn không có quyền truy cập."
                )
            );

        }

        next();

    };

}

module.exports = authorize;