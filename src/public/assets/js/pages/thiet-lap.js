"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "thiet-lap",

                detailTitle:
                    "Thông tin thiết lập",

                columns: [
                    {
                        key: "maThietLap",
                        label: "Mã thiết lập",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenThietLap",
                        label: "Tên thiết lập",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "giaTri",
                        label: "Giá trị",
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
                        record.maThietLap

            });

    }
);