"use strict";

class DanhMucWebController {

    renderPage(
        config
    ) {

        return async (
            req,
            res,
            next
        ) => {

            try {

                const currentYear =
                    new Date()
                        .getFullYear();


                const currentUser =
                    req.user ||
                    null;


                return res.render(
                    config.view,
                    {

                        layout:
                            "app",

                        title:
                            config.title,

                        pageTitle:
                            config.title,

                        pageDescription:
                            config.description ||
                            "",

                        currentYear,

                        appVersion:
                            process.env
                                .APP_VERSION ||
                            "1.0.0",

                        currentUser,

                        isCatalogPage:
                            true,

                        activeMenu:
                            config.activeMenu ||
                            "danh-muc",

                        activeSubmenu:
                            config.activeSubmenu,

                        breadcrumbs:
                            config.breadcrumbs ||
                            [],

                        /*
                         * Cấu hình bảng.
                         */
                        columns:
                            config.columns ||
                            [],

                        showActions:
                            config.showActions !==
                            false,

                        showIndex:
                            config.showIndex !==
                            false,

                        showFilterRow:
                            config.showFilterRow !==
                            false,

                        selectable:
                            config.selectable ===
                            true,

                        /*
                         * Cấu hình giao diện.
                         */
                        searchPlaceholder:
                            config.searchPlaceholder ||
                            "Tìm theo mã hoặc tên...",

                        hideCreateButton:
                            config.hideCreateButton ===
                            true,

                        showExportButton:
                            config.showExportButton ===
                            true

                    }
                );

            } catch (
                error
            ) {

                next(
                    error
                );

            }

        };

    }

}


module.exports =
    new DanhMucWebController();