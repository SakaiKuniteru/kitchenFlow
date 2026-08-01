"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "nhom-mon-an",

                detailTitle:
                    "Thông tin nhóm món ăn",

                columns: [
                    {
                        key: "maNhomMonAn",
                        label: "Mã nhóm",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenNhomMonAn",
                        label: "Tên nhóm món ăn",
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
                        record.maNhomMonAn

            });

    }
);