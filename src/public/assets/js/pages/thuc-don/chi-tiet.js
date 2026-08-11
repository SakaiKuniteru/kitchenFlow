"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            "/api/mcs/v1/thuc-don";


        const root =
            document.querySelector(
                "[data-thuc-don-detail]"
            );


        if (!root) {
            return;
        }


        const id =
            Number(
                root.dataset
                    .thucDonId
            );


        if (!id) {

            console.error(
                "Không xác định được ID thực đơn."
            );

            return;

        }


        initialize();

        async function duyet() {

            const response =
                await window.MCS.api.request(
                    `${API_BASE}/duyet/${id}`,
                    {
                        method:
                            "PATCH"
                    }
                );


            await loadDetail();

        }

        async function huy() {

            const confirmed =
                await confirmAction(
                    "Bạn có chắc chắn muốn hủy thực đơn này?"
                );


            if (!confirmed) {
                return;
            }


            await window.MCS.api.request(
                `${API_BASE}/huy/${id}`,
                {
                    method:
                        "PATCH"
                }
            );


            await loadDetail();

        }

        async function initialize() {

            await loadDetail();

        }


        async function loadDetail() {

            try {

                const response =
                    await window.MCS.api.request(
                        `${API_BASE}/${id}`
                    );


                renderDetail(
                    response?.data
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );

            }

        }


        function renderDetail(
            data
        ) {

            if (!data) {
                return;
            }

            console.log(
                "Chi tiết thực đơn:",
                data
            );

        }

    }
);