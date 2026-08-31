"use strict";

class ThongBaoWebController {

    async cuaToi(
        req,
        res,
        next
    ) {
        try {
            return res.render(
                "pages/thong-bao/index",
                {
                    layout:
                        "app",

                    title:
                        "Thông báo",

                    pageTitle:
                        "Thông báo",

                    pageDescription:
                        "Danh sách thông báo của tài khoản.",

                    currentYear:
                        new Date()
                            .getFullYear(),

                    appVersion:
                        process.env
                            .APP_VERSION ||
                        "1.0.0",

                    currentUser:
                        req.user ||
                        null,

                    breadcrumbs: [
                        {
                            label:
                                "Thông báo"
                        }
                    ]
                }
            );

        } catch (error) {
            next(error);
        }
    }

}

module.exports =
    new ThongBaoWebController();