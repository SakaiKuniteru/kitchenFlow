"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "chinh-sach",

                detailTitle:
                    "Thông tin chính sách",

                columns: [
                    {
                        key: "maChinhSach",
                        label: "Mã chính sách",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenChinhSach",
                        label: "Tên chính sách",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "moTa",
                        label: "Mô tả",
                        filterable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
                    }
                ],

                getRecordSubtitle:
                    record =>
                        record.maChinhSach

            });

    }
);