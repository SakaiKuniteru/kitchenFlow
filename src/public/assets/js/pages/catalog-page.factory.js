"use strict";

window.MCS = window.MCS || {};

window.MCS.pages = window.MCS.pages || {};

window.MCS.pages.instances = window.MCS.pages.instances || {};

window.MCS.pages.createCatalogPage = async function createCatalogPage(options = {}) {
    const {
        moduleName,
        columns = [],
        defaultValues = {
            active: true
        },
        detailTitle,
        createTitle,
        updateTitle,
        mapRecordToForm,
        transformPayload,
        validation = {},
        validate,
        onSubmitError,
        getRecordSubtitle,
        mapListResponse,
        mapDetailResponse,
        actions,
        toolbarActions = [],
        onRecordLoaded,
        onAction,
        viewOnly = false
    } = options;

    if (!moduleName) {
        throw new Error(
            "moduleName là bắt buộc."
        );
    }

    const root = document.querySelector(
        `[data-catalog-page][data-module="${moduleName}"]`
    );

    if (!root) {
        console.warn(
            `Không tìm thấy màn hình ${moduleName}.`
        );

        return null;
    }

    const configElement = document.getElementById(
        `${moduleName}PageConfig`
    );

    let pageConfig = {};

    if (configElement) {
        try {
            pageConfig = JSON.parse(
                configElement.textContent
            );
        } catch (error) {
            console.error(
                `Cấu hình trang ${moduleName} không hợp lệ.`,
                error
            );
        }
    }

    const apiBase = pageConfig.apiBase || root.dataset.apiBase || "";

    const endpoints = {
        list:
            pageConfig.listEndpoint ||
            (
                apiBase
                    ? `${apiBase}/tong-hop`
                    : ""
            ),

        detail:
            viewOnly
                ? ""
                : (
                    pageConfig.detailEndpoint ||
                    apiBase
                ),

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

    let catalogInstance = null;

    const commonValidate = async (data, form) => {
        const errors = {};

        Object.entries(
            validation
        ).forEach(([
            fieldName,
            rules
        ]) => {
            const value = data?.[
                fieldName
            ];

            const text =
                value === null ||
                value === undefined
                    ? ""
                    : String(
                        value
                    ).trim();

            if (
                rules.required === true &&
                !text
            ) {
                errors[
                    fieldName
                ] =
                    rules.requiredMessage ||
                    "Vui lòng điền vào trường này.";

                return;
            }

            if (
                rules.maxLength &&
                text.length > rules.maxLength
            ) {
                errors[
                    fieldName
                ] =
                    rules.maxLengthMessage ||
                    `${
                        rules.label ||
                        fieldName
                    } không được vượt quá ${
                        rules.maxLength
                    } ký tự.`;
            }
        });

        const currentId = catalogInstance
            ?.state
            ?.selectedId;

        Object.entries(
            validation
        ).forEach(([
            fieldName,
            rules
        ]) => {
            if (
                rules.unique !== true
            ) {
                return;
            }

            const value = data?.[
                fieldName
            ];

            const normalizedValue = normalizeValidationValue(
                value
            );

            if (
                !normalizedValue
            ) {
                return;
            }

            const duplicate = catalogInstance
                ?.state
                ?.allData
                ?.find(record => {
                    if (
                        currentId !== null &&
                        currentId !== undefined &&
                        String(
                            record?.id
                        ) ===
                        String(
                            currentId
                        )
                    ) {
                        return false;
                    }

                    return (
                        normalizeValidationValue(
                            record?.[
                                fieldName
                            ]
                        ) ===
                        normalizedValue
                    );
                });

            if (
                duplicate
            ) {
                errors[
                    fieldName
                ] =
                    rules.uniqueMessage ||
                    `${
                        rules.label ||
                        fieldName
                    } đã tồn tại.`;
            }
        });

        if (
            typeof validate === "function"
        ) {
            const customResult = await validate(
                data,
                form,
                catalogInstance
            );

            if (
                customResult &&
                typeof customResult === "object"
            ) {
                Object.assign(
                    errors,
                    customResult.errors ||
                    customResult
                );
            } else if (
                customResult === false
            ) {
                return false;
            }
        }

        return errors;
    };

    const catalog = new window.MCS.catalog.Catalog({
        root,
        endpoints,
        columns,
        toolbarActions,
        detailTitle,
        createTitle,
        updateTitle,
        defaultValues,
        mapRecordToForm,
        getRecordSubtitle,
        viewOnly,
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
            transformPayload,
            validate: commonValidate
        },

        onSubmitError,

        onRecordLoaded,

        onAction
    });

    catalogInstance = catalog;

    window.MCS.pages.instances[
        moduleName
    ] = catalog;

    await catalog.initialize();

    return catalog;
};

window.MCS.pages.initializeCatalogPage = function initializeCatalogPage(options = {}) {
    document.addEventListener(
        "DOMContentLoaded",
        async () => {
            try {
                await window.MCS.pages.createCatalogPage(
                    options
                );
            } catch (error) {
                console.error(
                    `Không thể khởi tạo trang ${options.moduleName}.`,
                    error
                );

                window.MCS.toast?.error(
                    error.message ||
                    "Không thể khởi tạo màn hình danh mục."
                );
            }
        }
    );
};

window.createStatusBadge = function createStatusBadge(value) {
    const badge = document.createElement(
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
                        ? "TRUE"
                        : "FALSE"
                }
            </span>
        `;

    return badge;
};

window.normalizeNumberArray = function normalizeNumberArray(value) {
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

function normalizeValidationValue(value) {
    return String(
        value ??
        ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();
}