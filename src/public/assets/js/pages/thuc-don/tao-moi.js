"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/thuc-don";


        const form =
            document.querySelector(
                "[data-thuc-don-create-form]"
            );


        form?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const payload =
                    getPayload();


                try {

                    const response =
                        await window.MCS.api.request(
                            `${API_BASE}/them-moi`,
                            {
                                method:
                                    "POST",

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const id =
                        response?.data?.id;


                    if (!id) {

                        throw new Error(
                            "Không nhận được ID thực đơn vừa tạo."
                        );

                    }


                    if (
                        window.MCS?.toast
                            ?.success
                    ) {

                        window.MCS.toast.success(
                            "Thêm mới thực đơn thành công."
                        );

                    }


                    window.location.href =
                        `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`;

                } catch (
                    error
                ) {

                    if (
                        window.MCS?.toast
                            ?.error
                    ) {

                        window.MCS.toast.error(
                            error?.message ||
                            "Thêm mới thực đơn thất bại."
                        );

                    }

                }

            }
        );


        function getPayload() {

            return {

            };

        }

    }
);