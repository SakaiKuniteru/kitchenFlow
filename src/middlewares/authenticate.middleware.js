const jwt = require("../utils/jwt");

const ApiError = require("../utils/api-error");

function authenticate(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization) {

        return next(

            new ApiError(
                401,
                "Chưa đăng nhập."
            )

        );

    }

    if (
        !authorization.startsWith(
            "Bearer "
        )
    ) {

        return next(

            new ApiError(
                401,
                "Access Token không hợp lệ."
            )

        );

    }

    const accessToken = authorization.replace(
        "Bearer ",
        ""
    );

    try {

        const payload =
            jwt.verifyAccessToken(
                accessToken
            );

        req.user = payload;

        next();

    }
    catch (error) {

        next(

            new ApiError(
                401,
                "Access Token đã hết hạn."
            )

        );

    }

}

module.exports = authenticate;