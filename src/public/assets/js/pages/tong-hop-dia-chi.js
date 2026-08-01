"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const catalog =
            await window.MCS.pages
                .createCatalogPage({

                    moduleName:
                        "tong-hop-dia-chi",

                    detailTitle:
                        "Thông tin địa chỉ hành chính",

                    columns: [
                        {
                            key: "maQuocGia",
                            label: "Mã quốc gia",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "tenQuocGia",
                            label: "Quốc gia",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "maTinhThanh",
                            label: "Mã tỉnh thành",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "tenTinhThanh",
                            label: "Tỉnh thành",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "maXaPhuong",
                            label: "Mã xã phường",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "tenXaPhuong",
                            label: "Xã phường",
                            sortable: true,
                            filterable: true
                        },
                        {
                            key: "active",
                            label: "Trạng thái",
                            render: createStatusBadge
                        }
                    ],

                    actions:
                        () => [
                            {
                                key:
                                    "view",

                                label:
                                    "Xem chi tiết",

                                icon:
                                    "◉"
                            }
                        ]

                });


        if (catalog?.elements.create) {

            catalog.elements.create.hidden =
                true;

        }

    }
);