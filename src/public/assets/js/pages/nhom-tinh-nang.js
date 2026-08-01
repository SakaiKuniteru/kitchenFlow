"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "nhom-tinh-nang",

                detailTitle:
                    "Thông tin nhóm tính năng",

                columns: [
                    {
                        key: "maNhomTinhNang",
                        label: "Mã nhóm",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenNhomTinhNang",
                        label: "Tên nhóm tính năng",
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
                        record.maNhomTinhNang

            });

    }
);