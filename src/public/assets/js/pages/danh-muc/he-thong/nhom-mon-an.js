"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/dm-nhom-mon-an";


        let catalog =
            null;


        initialize();


        async function initialize() {

            await initializeCatalog();

        }


        async function initializeCatalog() {

            try {

                catalog =
                    await window.MCS
                        .pages
                        .createCatalogPage({

                            moduleName:
                                "nhom-mon-an",


                            columns: [

                                {
                                    key:
                                        "maNhomMonAn",

                                    label:
                                        "Mã nhóm",

                                    width:
                                        "180px",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "tenNhomMonAn",

                                    label:
                                        "Tên nhóm món ăn",

                                    width:
                                        "240px",

                                    sortable:
                                        true,

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "moTa",

                                    label:
                                        "Mô tả",

                                    width:
                                        "360px",

                                    filterable:
                                        true
                                },


                                {
                                    key:
                                        "active",

                                    label:
                                        "Trạng thái",

                                    width:
                                        "130px",

                                    sortable:
                                        true,

                                    isBoolean:
                                        true,

                                    trueLabel:
                                        "TRUE",

                                    falseLabel:
                                        "FALSE"
                                }

                            ],


                            defaultValues: {

                                maNhomMonAn:
                                    "",

                                tenNhomMonAn:
                                    "",

                                moTa:
                                    "",

                                active:
                                    true

                            },


                            detailTitle:
                                "Thông tin nhóm món ăn",


                            createTitle:
                                "Thêm nhóm món ăn",


                            updateTitle:
                                "Cập nhật nhóm món ăn",


                            getRecordSubtitle(
                                record
                            ) {

                                return (
                                    record?.maNhomMonAn ||
                                    ""
                                );

                            },


                            mapListResponse(
                                result
                            ) {

                                return Array.isArray(
                                    result?.data
                                )
                                    ? result.data
                                    : [];

                            },


                            mapDetailResponse(
                                result
                            ) {

                                return (
                                    result?.data ||
                                    null
                                );

                            },


                            mapRecordToForm(
                                record
                            ) {

                                return {

                                    id:
                                        record?.id ??
                                        "",

                                    maNhomMonAn:
                                        record?.maNhomMonAn ||
                                        "",

                                    tenNhomMonAn:
                                        record?.tenNhomMonAn ||
                                        "",

                                    moTa:
                                        record?.moTa ||
                                        "",

                                    active:
                                        record?.active ===
                                        true

                                };

                            },


                            transformPayload(
                                formData
                            ) {

                                return {

                                    maNhomMonAn:
                                        String(
                                            formData.maNhomMonAn ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase(),

                                    tenNhomMonAn:
                                        String(
                                            formData.tenNhomMonAn ||
                                            ""
                                        ).trim(),

                                    moTa:
                                        String(
                                            formData.moTa ||
                                            ""
                                        ).trim(),

                                    active:
                                        formData.active ===
                                            true

                                };

                            },


                            /*
                             * Validate trực tiếp tại FE.
                             *
                             * createCatalogPage chỉ cần gọi callback này
                             * trước khi gửi API.
                             */
                            validate(
                                formData
                            ) {

                                clearValidationErrors();


                                const errors =
                                    validateForm(
                                        formData
                                    );


                                if (
                                    Object.keys(
                                        errors
                                    ).length ===
                                    0
                                ) {

                                    return true;

                                }


                                Object.entries(
                                    errors
                                )
                                    .forEach(
                                        ([
                                            field,
                                            message
                                        ]) => {

                                            setFieldError(
                                                field,
                                                message
                                            );

                                        }
                                    );


                                focusFirstError(
                                    errors
                                );


                                return false;

                            },


                            onRecordLoaded() {

                                clearValidationErrors();

                            },


                            onAction(
                                action,
                                id,
                                catalogInstance
                            ) {

                                if (
                                    action ===
                                    "export"
                                ) {

                                    exportData();

                                    return;

                                }


                                if (
                                    action ===
                                    "import"
                                ) {

                                    importData(
                                        catalogInstance
                                    );

                                }

                            }

                        });


                bindLiveValidation();

            } catch (
                error
            ) {

                console.error(
                    "Không thể khởi tạo danh mục nhóm món ăn.",
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        "Không thể tải danh mục nhóm món ăn."
                    );

            }

        }


        function validateForm(
            formData
        ) {

            const errors = {};


            const maNhomMonAn =
                String(
                    formData?.maNhomMonAn ||
                    ""
                ).trim();


            const tenNhomMonAn =
                String(
                    formData?.tenNhomMonAn ||
                    ""
                ).trim();


            const moTa =
                String(
                    formData?.moTa ||
                    ""
                ).trim();


            if (!maNhomMonAn) {

                errors.maNhomMonAn =
                    "Vui lòng điền vào trường này.";

            } else if (
                maNhomMonAn.length >
                50
            ) {

                errors.maNhomMonAn =
                    "Mã nhóm món ăn không được vượt quá 50 ký tự.";

            }


            if (!tenNhomMonAn) {

                errors.tenNhomMonAn =
                    "Vui lòng điền vào trường này.";

            } else if (
                tenNhomMonAn.length >
                150
            ) {

                errors.tenNhomMonAn =
                    "Tên nhóm món ăn không được vượt quá 150 ký tự.";

            }


            if (!moTa) {

                errors.moTa =
                    "Vui lòng điền vào trường này.";

            } else if (
                moTa.length >
                500
            ) {

                errors.moTa =
                    "Mô tả không được vượt quá 500 ký tự.";

            }


            return errors;

        }


        function getField(
            name
        ) {

            return document
                .querySelector(
                    `[name="${name}"]`
                );

        }


        function getFieldWrapper(
            name
        ) {

            return document
                .querySelector(
                    `[data-form-field="${name}"]`
                );

        }


        function getFieldError(
            name
        ) {

            return document
                .querySelector(
                    `[data-field-error="${name}"]`
                );

        }


        function setFieldError(
            name,
            message
        ) {

            const field =
                getField(
                    name
                );


            const wrapper =
                getFieldWrapper(
                    name
                );


            const errorElement =
                getFieldError(
                    name
                );


            wrapper
                ?.classList
                .add(
                    "has-error"
                );


            field
                ?.classList
                .add(
                    "is-invalid"
                );


            field?.setAttribute(
                "aria-invalid",
                "true"
            );


            if (
                errorElement
            ) {

                errorElement.textContent =
                    message;


                errorElement.hidden =
                    false;

            }

        }


        function clearFieldError(
            name
        ) {

            const field =
                getField(
                    name
                );


            const wrapper =
                getFieldWrapper(
                    name
                );


            const errorElement =
                getFieldError(
                    name
                );


            wrapper
                ?.classList
                .remove(
                    "has-error"
                );


            field
                ?.classList
                .remove(
                    "is-invalid"
                );


            field?.removeAttribute(
                "aria-invalid"
            );


            if (
                errorElement
            ) {

                errorElement.textContent =
                    "";


                errorElement.hidden =
                    true;

            }

        }


        function clearValidationErrors() {

            [
                "maNhomMonAn",
                "tenNhomMonAn",
                "moTa"
            ]
                .forEach(
                    clearFieldError
                );

        }


        function focusFirstError(
            errors
        ) {

            const firstFieldName =
                Object.keys(
                    errors
                )[0];


            if (
                !firstFieldName
            ) {

                return;

            }


            getField(
                firstFieldName
            )
                ?.focus();

        }


        function bindLiveValidation() {

            [
                "maNhomMonAn",
                "tenNhomMonAn",
                "moTa"
            ]
                .forEach(
                    name => {

                        const field =
                            getField(
                                name
                            );


                        if (
                            !field ||
                            field.dataset
                                .nhomMonAnValidationBound ===
                                "true"
                        ) {

                            return;

                        }


                        field.addEventListener(
                            "input",
                            () => {

                                clearFieldError(
                                    name
                                );

                            }
                        );


                        field.addEventListener(
                            "change",
                            () => {

                                clearFieldError(
                                    name
                                );

                            }
                        );


                        field.dataset
                            .nhomMonAnValidationBound =
                            "true";

                    }
                );

        }


        async function exportData() {

            try {

                const result =
                    await window.MCS
                        .api
                        .requestFile(
                            `${API_BASE}/xuat-du-lieu`,
                            {
                                method:
                                    "GET"
                            }
                        );


                window.MCS
                    .api
                    .downloadBlob(
                        result.blob,
                        result.fileName ||
                        "dm_nhom_mon_an.xlsx"
                    );


                window.MCS
                    ?.toast
                    ?.success(
                        "Xuất dữ liệu thành công."
                    );

            } catch (
                error
            ) {

                console.error(
                    "Xuất dữ liệu nhóm món ăn thất bại:",
                    error
                );


                window.MCS
                    ?.toast
                    ?.error(
                        error?.message ||
                        "Xuất dữ liệu thất bại."
                    );

            }

        }


        function importData(
            catalogInstance
        ) {

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "file";


            input.accept =
                ".xlsx,.xls,.xlsm";


            input.hidden =
                true;


            document.body
                .appendChild(
                    input
                );


            input.addEventListener(
                "change",
                async () => {

                    const file =
                        input.files?.[0];


                    if (!file) {

                        input.remove();

                        return;

                    }


                    try {

                        const body =
                            new FormData();


                        body.append(
                            "file",
                            file
                        );


                        const result =
                            await window.MCS
                                .api
                                .requestFile(
                                    `${API_BASE}/import-du-lieu`,
                                    {
                                        method:
                                            "POST",

                                        body
                                    }
                                );


                        window.MCS
                            .api
                            .downloadBlob(
                                result.blob,
                                result.fileName ||
                                `dm_nhom_mon_an_import_${
                                    Date.now()
                                }.xlsx`
                            );


                        if (
                            catalogInstance
                                ?.load
                        ) {

                            await catalogInstance
                                .load();

                        }


                        window.MCS
                            ?.toast
                            ?.success(
                                "Đã xử lý import. Vui lòng kiểm tra file kết quả."
                            );

                    } catch (
                        error
                    ) {

                        console.error(
                            "Import nhóm món ăn thất bại:",
                            error
                        );


                        window.MCS
                            ?.toast
                            ?.error(
                                error?.message ||
                                "Import dữ liệu thất bại."
                            );

                    } finally {

                        input.remove();

                    }

                }
            );


            input.click();

        }

    }
);