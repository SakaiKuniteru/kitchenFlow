"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "tinh-thanh",

                detailTitle:
                    "Thông tin tỉnh thành",

                columns: [
                    {
                        key: "maTinhThanh",
                        label: "Mã tỉnh thành",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenTinhThanh",
                        label: "Tên tỉnh thành",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenVietTat",
                        label: "Tên viết tắt",
                        filterable: true
                    },
                    {
                        key: "quocGia.ten",
                        label: "Quốc gia",
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

                        quocGiaId:
                            Number(
                                data.quocGiaId
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maTinhThanh

            });

    }
);