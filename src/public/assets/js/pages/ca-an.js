"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "ca-an",

                detailTitle:
                    "Thông tin ca ăn",

                columns: [
                    {
                        key: "maCaAn",
                        label: "Mã ca ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenCaAn",
                        label: "Tên ca ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "thoiGianBatDau",
                        label: "Thời gian bắt đầu",
                        sortable: true
                    },
                    {
                        key: "thoiGianKetThuc",
                        label: "Thời gian kết thúc",
                        sortable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
                    }
                ],

                getRecordSubtitle:
                    record =>
                        record.maCaAn

            });

    }
);