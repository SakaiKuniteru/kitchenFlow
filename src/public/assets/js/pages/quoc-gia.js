"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "quoc-gia",

                detailTitle:
                    "Thông tin quốc gia",

                columns: [
                    {
                        key: "maQuocGia",
                        label: "Mã quốc gia",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenQuocGia",
                        label: "Tên quốc gia",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenTiengAnh",
                        label: "Tên tiếng Anh",
                        filterable: true
                    },
                    {
                        key: "maIso2",
                        label: "ISO2",
                        sortable: true
                    },
                    {
                        key: "maIso3",
                        label: "ISO3",
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
                        record.maQuocGia

            });

    }
);