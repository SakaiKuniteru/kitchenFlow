"use strict";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const root =
            document.querySelector(
                '[data-thuc-don-editor][data-form-mode="create"]'
            );


        if (!root) {
            return;
        }


        console.log(
            "[THEM MOI] RUN"
        );


        const editor =
            window.ThucDonEditor.init(
                root,
                {

                    mode:
                        "create",

                    onSave:
                        async data => {

                            console.log(
                                "SAVE CREATE",
                                data
                            );

                        },

                    onSaveApprove:
                        async data => {

                            console.log(
                                "SAVE + APPROVE CREATE",
                                data
                            );

                        }

                }
            );


        if (!editor) {
            return;
        }


        const data = {

            id:
                null,

            maThucDon:
                "",

            tenThucDon:
                "",

            loaiThucDon:
                null,

            tuNgay:
                null,

            denNgay:
                null,

            coSoId:
                null,

            nhaAnId:
                null,

            caAnId:
                null,

            trangThai:
                10,

            moTa:
                null,

            active:
                true,

            dsNgay:
                []

        };


        await window
            .ThucDonFormOptions
            ?.init(
                root,
                data
            );


        await editor.setData(
            data
        );


        window
            .ThucDonFormImage
            ?.init(
                root
            );

    }
);