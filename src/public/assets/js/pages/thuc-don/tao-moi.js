"use strict";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const root =
            document.querySelector(
                "[data-thuc-don-create]"
            );

        if (!root) return;


        const form =
            window.MCS.thucDon.form;

        const api =
            window.MCS.thucDon.api;

        const confirm =
            window.MCS.thucDon.confirm;

        const U =
            window.MCS.thucDon.utils;


        await form.initialize({

            mode:
                "create",

            data: {

                loaiThucDon:
                    20,

                trangThai:
                    10,

                active:
                    true,

                dsNgay:
                    []

            }

        });


        root
            .querySelector(
                "[data-create-cancel]"
            )
            ?.addEventListener(
                "click",
                () =>
                    window.history.back()
            );


        root
            .querySelector(
                "[data-create-save]"
            )
            ?.addEventListener(
                "click",
                () =>
                    confirm.save(
                        save
                    )
            );


        async function save() {

            try {

                const r =
                    await api.create(
                        form.getPayload()
                    );


                U.toast(
                    "success",
                    r?.message ||
                    "Tạo thực đơn thành công."
                );


                const id =
                    r?.data?.id;


                window.location.href =
                    id
                        ? `/thuc-don/chi-tiet/${id}`
                        : "/thuc-don/danh-sach";

            }
            catch (error) {

                U.toast(
                    "error",
                    error?.message ||
                    "Tạo thực đơn thất bại."
                );

            }

        }

    }
);