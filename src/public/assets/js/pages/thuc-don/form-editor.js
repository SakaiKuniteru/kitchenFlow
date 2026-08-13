"use strict";

window.ThucDonEditor = (() => {

    const TRANG_THAI = Object.freeze({

        TAO_MOI_CHO_DUYET:
            10,

        CHO_DUYET:
            20,

        DANG_AP_DUNG:
            30,

        CHO_DUYET_LAI:
            40,

        DA_HUY:
            50,

        DA_KET_THUC:
            60

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
            formRoot,
            form,
            state,
            options
        );


        return {

            async setData(
                data
            ) {

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


            async setWorkingData(
                data
            ) {

                const normalized =
                    cloneData(
                        data
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

                const current =
                    typeof form.getData ===
                    "function"
                        ? form.getData()
                        : state.currentData;


                state.currentData =
                    cloneData(
                        current
                    );


                return cloneData(
                    current
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

            },


            replaceInitialData(
                data
            ) {

                state.initialData =
                    cloneData(
                        data
                    );


                state.currentData =
                    cloneData(
                        data
                    );

            }

        };

    }

    function bindActions(
        root,
        formRoot,
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

                showConfirm({

                    title:
                        "Quay lại",

                    message:
                        "Các thay đổi chưa lưu sẽ bị mất. Bạn có muốn quay lại trang trước?",

                    confirmLabel:
                        "Quay lại",

                    type:
                        "warning",

                    onConfirm:
                        () => {

                            window.history.back();

                        }

                });

            }
        );

        cancelButton?.addEventListener(
            "click",
            () => {

                showConfirm({

                    title:
                        "Hủy thay đổi",

                    message:
                        "Toàn bộ dữ liệu vừa thay đổi sẽ được khôi phục về trạng thái ban đầu.",

                    confirmLabel:
                        "Hủy thay đổi",

                    type:
                        "danger",

                    onConfirm:
                        () => {

                            resetForm(
                                root,
                                formRoot,
                                form,
                                state
                            );

                        }

                });

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

    function showConfirm(
        config
    ) {

        if (
            window.MCS
                ?.confirm
                ?.show
        ) {

            window.MCS.confirm.show(
                config
            );

            return;

        }


        if (
            window.confirm(
                config.message
            )
        ) {

            config.onConfirm?.();

        }

    }


    function buildPayload(
        form,
        state
    ) {

        const data =
            typeof form.getData ===
            "function"
                ? form.getData()
                : state.currentData;


        state.currentData =
            cloneData(
                data
            );


        return cloneData(
            data
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


        clearGeneralError(
            root
        );


        window.MCS
            ?.toast
            ?.success(
                "Đã khôi phục dữ liệu ban đầu."
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


        select.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles:
                        true
                }
            )
        );

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


        const classMap = {

            10:
                "is-new",

            20:
                "is-pending",

            30:
                "is-active",

            40:
                "is-review",

            50:
                "is-cancelled",

            60:
                "is-ended"

        };


        if (
            classMap[
                status
            ]
        ) {

            element.classList.add(
                classMap[
                    status
                ]
            );

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


    function clearGeneralError(
        root
    ) {

        const error =
            root.querySelector(
                "[data-general-error]"
            );


        if (error) {
            error.hidden = true;
        }


        root.querySelectorAll(
            ".form-field.has-error"
        )
            .forEach(
                element =>
                    element.classList.remove(
                        "has-error"
                    )
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


    return {
        init
    };

})();