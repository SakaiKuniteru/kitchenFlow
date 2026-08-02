"use strict";


window.MCS =
    window.MCS || {};


window.MCS.pages =
    window.MCS.pages || {};


window.MCS.pages.instances =
    window.MCS.pages.instances || {};


window.MCS.pages.createCatalogPage =
    async function createCatalogPage(
        options = {}
    ) {

        const {
            moduleName,
            columns = [],
            defaultValues = {
                active:
                    true
            },
            detailTitle,
            createTitle,
            updateTitle,
            mapRecordToForm,
            transformPayload,
            getRecordSubtitle,
            mapListResponse,
            mapDetailResponse,
            actions,
            onRecordLoaded,
            onAction
        } = options;


        if (!moduleName) {

            throw new Error(
                "moduleName là bắt buộc."
            );

        }


        const root =
            document.querySelector(
                `[data-catalog-page][data-module="${moduleName}"]`
            );


        if (!root) {

            console.warn(
                `Không tìm thấy màn hình ${moduleName}.`
            );

            return null;

        }


        const configElement =
            document.getElementById(
                `${moduleName}PageConfig`
            );


        let pageConfig =
            {};


        if (configElement) {

            try {

                pageConfig =
                    JSON.parse(
                        configElement.textContent
                    );

            } catch (error) {

                console.error(
                    `Cấu hình trang ${moduleName} không hợp lệ.`,
                    error
                );

            }

        }


        const apiBase =
            pageConfig.apiBase ||
            root.dataset.apiBase ||
            "";


        const endpoints = {

            list:
                pageConfig.listEndpoint ||
                (
                    apiBase
                        ? `${apiBase}/tong-hop`
                        : ""
                ),

            detail:
                pageConfig.detailEndpoint ||
                apiBase,

            create:
                pageConfig.createEndpoint ||
                (
                    apiBase
                        ? `${apiBase}/them-moi`
                        : ""
                ),

            update:
                pageConfig.updateEndpoint ||
                (
                    apiBase
                        ? `${apiBase}/cap-nhat`
                        : ""
                )

        };


        const catalog =
            new window.MCS.catalog.Catalog({

                root,

                endpoints,

                columns,

                detailTitle,

                createTitle,

                updateTitle,

                defaultValues,

                mapRecordToForm,

                getRecordSubtitle,

                mapListResponse:
                    mapListResponse ||
                    (
                        result =>
                            result?.data ||
                            []
                    ),

                mapDetailResponse:
                    mapDetailResponse ||
                    (
                        result =>
                            result?.data ||
                            null
                    ),

                table: {
                    actions
                },

                form: {
                    transformPayload
                },

                onRecordLoaded,

                onAction

            });


        window.MCS.pages.instances[
            moduleName
        ] =
            catalog;


        await catalog.initialize();


        return catalog;

    };


window.MCS.pages.initializeCatalogPage =
    function initializeCatalogPage(
        options = {}
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            async () => {

                try {

                    await window.MCS.pages
                        .createCatalogPage(
                            options
                        );

                } catch (error) {

                    console.error(
                        `Không thể khởi tạo trang ${options.moduleName}.`,
                        error
                    );

                    window.MCS.toast
                        ?.error(
                            error.message ||
                            "Không thể khởi tạo màn hình danh mục."
                        );

                }

            }
        );

    };


window.createStatusBadge =
    function createStatusBadge(
        value
    ) {

        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            value
                ? "status-badge status-badge--success"
                : "status-badge status-badge--danger";


        badge.innerHTML = `
            <span
                class="status-badge__dot"
                aria-hidden="true">
            </span>

            <span>
                ${
                    value
                        ? "Đang hoạt động"
                        : "Đã khóa"
                }
            </span>
        `;


        return badge;

    };


window.normalizeNumberArray =
    function normalizeNumberArray(
        value
    ) {

        if (
            Array.isArray(value)
        ) {

            return value
                .map(Number)
                .filter(
                    Number.isInteger
                );

        }


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return [];

        }


        return String(value)
            .split(",")
            .map(
                item =>
                    Number(
                        item.trim()
                    )
            )
            .filter(
                Number.isInteger
            );

    };