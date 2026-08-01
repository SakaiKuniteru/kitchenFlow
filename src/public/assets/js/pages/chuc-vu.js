"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "chuc-vu",

                detailTitle:
                    "Thông tin chức vụ",

                columns: [
                    {
                        key: "maChucVu",
                        label: "Mã chức vụ",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenChucVu",
                        label: "Tên chức vụ",
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
                        record.maChucVu

            });

    }
);