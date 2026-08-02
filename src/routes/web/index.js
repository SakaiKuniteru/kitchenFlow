"use strict";


const express =
    require(
        "express"
    );


const router =
    express.Router();


const webRoutes =
    require(
        "./config"
    );


router.get(
    "/",
    (
        req,
        res,
        next
    ) => {

        try {

            return res.render(
                "pages/home/index",
                {

                    layout:
                        "app",

                    title:
                        "Trang chủ",

                    currentYear:
                        new Date()
                            .getFullYear(),

                    currentUser:
                        req.user ||
                        null,

                    appVersion:
                        process.env
                            .APP_VERSION ||
                        "1.0.0",

                    breadcrumbs: [
                        {
                            label:
                                "Trang chủ"
                        }
                    ]

                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


router.get(
    "/auth/login",
    (
        req,
        res,
        next
    ) => {

        try {

            return res.render(
                "pages/auth/login",
                {

                    layout:
                        "auth",

                    title:
                        "Đăng nhập",

                    currentYear:
                        new Date()
                            .getFullYear(),

                    appVersion:
                        process.env
                            .APP_VERSION ||
                        "1.0.0"

                }
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


webRoutes.forEach(
    route => {

        const method =
            String(
                route.method ||
                "get"
            )
                .toLowerCase();


        if (
            typeof router[
                method
            ] !== "function"
        ) {

            throw new Error(
                `HTTP method không hợp lệ: ${method}`
            );

        }


        router[
            method
        ](
            route.path,
            route.handler
        );

    }
);


module.exports =
    router;