class DanhMucWebController {

    renderPage(config) {

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
                    req.user || null;

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
                            config.description || "",

                        currentYear,

                        appVersion:
                            process.env
                                .APP_VERSION ||
                            "1.0.0",

                        currentUser,

                        isCatalogPage:
                            true,

                        activeMenu:
                            config.activeMenu,

                        activeSubmenu:
                            config.activeSubmenu,

                        breadcrumbs:
                            config.breadcrumbs || []

                    }
                );

            } catch (error) {

                next(error);

            }

        };

    }

}

module.exports =
    new DanhMucWebController();