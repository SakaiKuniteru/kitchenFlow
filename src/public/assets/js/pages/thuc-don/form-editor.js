"use strict";

window.ThucDonEditor = (() => {

    const TRANG_THAI = Object.freeze({

        TAO_MOI_CHO_DUYET: 10,

        CHO_DUYET: 20,

        DANG_AP_DUNG: 30,

        CHO_DUYET_LAI: 40,

        DA_HUY: 50,

        DA_KET_THUC: 60

    });


    function init(
        root,
        options = {}
    ) {

        if (!root) {
            return null;
        }


        const formRoot =
            root.querySelector(
                "[data-thuc-don-form]"
            );


        if (!formRoot) {

            console.error(
                "Không tìm thấy form thực đơn."
            );

            return null;

        }


        if (!window.ThucDonForm) {

            console.error(
                "ThucDonForm chưa được khởi tạo."
            );

            return null;

        }


        const form =
            window.ThucDonForm.init(
                formRoot
            );


        if (!form) {

            console.error(
                "Không khởi tạo được ThucDonForm."
            );

            return null;

        }


        const state = {

            mode:
                options.mode ||
                root.dataset.formMode ||
                "create",

            id:
                options.id ||
                root.dataset.thucDonId ||
                null,

            initialData:
                null,

            currentData:
                null,

            loading:
                false

        };


        bindActions(
            root,
            form,
            state,
            options
        );


        return {

            async setData(data) {

                const normalized =
                    cloneData(
                        data
                    );


                state.initialData =
                    cloneData(
                        normalized
                    );


                state.currentData =
                    cloneData(
                        normalized
                    );


                form.setData(
                    normalized
                );


                renderEditorGeneral(
                    formRoot,
                    normalized
                );


                renderActions(
                    root,
                    normalized
                );

            },


            getData() {

                if (
                    typeof form.getData ===
                    "function"
                ) {

                    return form.getData();

                }


                return cloneData(
                    state.currentData
                );

            },


            getState() {

                return state;

            },


            reset() {

                resetForm(
                    root,
                    formRoot,
                    form,
                    state
                );

            }

        };

    }


    function bindActions(
        root,
        form,
        state,
        options
    ) {

        const backButton =
            root.querySelector(
                "[data-form-back]"
            );


        const cancelButton =
            root.querySelector(
                "[data-form-cancel]"
            );


        const saveButton =
            root.querySelector(
                "[data-form-save]"
            );


        const saveApproveButton =
            root.querySelector(
                "[data-form-save-approve]"
            );


        backButton?.addEventListener(
            "click",
            () => {

                window.history.back();

            }
        );


        cancelButton?.addEventListener(
            "click",
            () => {

                const execute =
                    () => {

                        const formRoot =
                            root.querySelector(
                                "[data-thuc-don-form]"
                            );


                        resetForm(
                            root,
                            formRoot,
                            form,
                            state
                        );

                    };


                if (
                    window.MCS
                        ?.confirm
                        ?.show
                ) {

                    window.MCS.confirm.show({

                        title:
                            "Hủy thay đổi",

                        message:
                            "Toàn bộ dữ liệu vừa thay đổi sẽ được khôi phục.",

                        confirmLabel:
                            "Hủy thay đổi",

                        type:
                            "warning",

                        onConfirm:
                            execute

                    });


                    return;

                }


                execute();

            }
        );


        saveButton?.addEventListener(
            "click",
            async () => {

                if (
                    typeof options.onSave !==
                    "function"
                ) {
                    return;
                }


                await options.onSave(
                    buildPayload(
                        form,
                        state
                    )
                );

            }
        );


        saveApproveButton?.addEventListener(
            "click",
            async () => {

                if (
                    typeof options.onSaveApprove !==
                    "function"
                ) {
                    return;
                }


                await options.onSaveApprove(
                    buildPayload(
                        form,
                        state
                    )
                );

            }
        );

    }


    function buildPayload(
        form,
        state
    ) {

        if (
            typeof form.getData ===
            "function"
        ) {

            return form.getData();

        }


        return cloneData(
            state.currentData
        );

    }


    function resetForm(
        root,
        formRoot,
        form,
        state
    ) {

        const data =
            cloneData(
                state.initialData
            );


        state.currentData =
            cloneData(
                data
            );


        form.setData(
            data
        );


        renderEditorGeneral(
            formRoot,
            data
        );


        renderActions(
            root,
            data
        );


        window.MCS
            ?.toast
            ?.success(
                "Đã hủy các thay đổi."
            );

    }


    function renderEditorGeneral(
        root,
        data
    ) {

        if (
            !root ||
            !data
        ) {
            return;
        }


        setInputValue(
            root,
            "maThucDon",
            data.maThucDon
        );


        setInputValue(
            root,
            "tenThucDon",
            data.tenThucDon
        );


        setInputValue(
            root,
            "moTa",
            data.moTa
        );


        setSelectValue(
            root,
            "loaiThucDon",
            data.loaiThucDon
        );


        setSelectValue(
            root,
            "coSoId",
            data.coSoId
        );


        setSelectValue(
            root,
            "nhaAnId",
            data.nhaAnId
        );


        setSelectValue(
            root,
            "caAnId",
            data.caAnId
        );


        renderStatus(
            root,
            data.trangThai
        );

    }


    function setInputValue(
        root,
        name,
        value
    ) {

        const input =
            root.querySelector(
                `[name="${name}"]`
            );


        if (!input) {
            return;
        }


        input.value =
            value ??
            "";

    }


    function setSelectValue(
        root,
        name,
        value
    ) {

        const select =
            root.querySelector(
                `select[name="${name}"]`
            );


        if (!select) {
            return;
        }


        select.value =
            value === null ||
            value === undefined
                ? ""
                : String(
                    value
                );


        const wrapper =
            select.closest(
                "[data-smart-select]"
            );


        if (!wrapper) {
            return;
        }


        const selectedOption =
            select.options[
                select.selectedIndex
            ];


        const selection =
            wrapper.querySelector(
                "[data-smart-select-selection]"
            );


        if (!selection) {
            return;
        }


        if (
            selectedOption &&
            selectedOption.value !== ""
        ) {

            selection.innerHTML = `
                <span>
                    ${escapeHtml(
                        selectedOption
                            .textContent
                            .trim()
                    )}
                </span>
            `;

        } else {

            selection.innerHTML = `
                <span class="smart-select__placeholder">
                    ${escapeHtml(
                        wrapper.dataset.selectPlaceholder ||
                        "Chọn dữ liệu..."
                    )}
                </span>
            `;

        }

    }


    function renderStatus(
        root,
        value
    ) {

        const element =
            root.querySelector(
                "[data-editor-status]"
            );


        if (!element) {
            return;
        }


        const status =
            Number(
                value ??
                10
            );


        const labels = {

            10:
                "Tạo mới/Chờ duyệt",

            20:
                "Chờ duyệt",

            30:
                "Đang áp dụng",

            40:
                "Chờ duyệt lại",

            50:
                "Đã hủy",

            60:
                "Đã kết thúc"

        };


        element.textContent =
            labels[
                status
            ] ||
            "-";


        element.classList.remove(
            "is-new",
            "is-pending",
            "is-active",
            "is-review",
            "is-cancelled",
            "is-ended"
        );


        switch (status) {

            case 10:

                element.classList.add(
                    "is-new"
                );

                break;


            case 20:

                element.classList.add(
                    "is-pending"
                );

                break;


            case 30:

                element.classList.add(
                    "is-active"
                );

                break;


            case 40:

                element.classList.add(
                    "is-review"
                );

                break;


            case 50:

                element.classList.add(
                    "is-cancelled"
                );

                break;


            case 60:

                element.classList.add(
                    "is-ended"
                );

                break;

        }

    }


    function renderActions(
        root,
        data
    ) {

        const saveApproveButton =
            root.querySelector(
                "[data-form-save-approve]"
            );


        if (!saveApproveButton) {
            return;
        }


        const trangThai =
            Number(
                data?.trangThai ??
                10
            );


        saveApproveButton.hidden =
            ![
                TRANG_THAI.TAO_MOI_CHO_DUYET,
                TRANG_THAI.CHO_DUYET,
                TRANG_THAI.CHO_DUYET_LAI
            ].includes(
                trangThai
            );

    }


    function cloneData(
        data
    ) {

        if (
            data === undefined ||
            data === null
        ) {
            return null;
        }


        return JSON.parse(
            JSON.stringify(
                data
            )
        );

    }


    function escapeHtml(
        value
    ) {

        return String(
            value ??
            ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    return {
        init
    };

})();