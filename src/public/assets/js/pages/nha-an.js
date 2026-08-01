"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "nha-an",

                detailTitle:
                    "Thông tin nhà ăn",

                columns: [
                    {
                        key: "maNhaAn",
                        label: "Mã nhà ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenNhaAn",
                        label: "Tên nhà ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "coSo.ten",
                        label: "Cơ sở",
                        filterable: true
                    },
                    {
                        key: "diaChi",
                        label: "Địa chỉ",
                        filterable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
                    }
                ],

                transformPayload:
                    data => ({

                        ...data,

                        coSoId:
                            Number(
                                data.coSoId
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maNhaAn

            });

    }
);