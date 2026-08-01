"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "thuc-pham",

                detailTitle:
                    "Thông tin thực phẩm",

                columns: [
                    {
                        key: "maThucPham",
                        label: "Mã thực phẩm",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenThucPham",
                        label: "Tên thực phẩm",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "quyCach",
                        label: "Quy cách",
                        filterable: true
                    },
                    {
                        key: "giaNhap",
                        label: "Giá nhập",
                        type: "currency",
                        sortable: true,
                        className:
                            "catalog-table__cell--right"
                    },
                    {
                        key: "haoHutDuKien",
                        label: "Hao hụt dự kiến",
                        type: "number"
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

                        donViSoCapId:
                            Number(
                                data.donViSoCapId
                            ),

                        donViSuDungId:
                            Number(
                                data.donViSuDungId
                            ),

                        heSoQuyDoi:
                            Number(
                                data.heSoQuyDoi
                            ),

                        giaNhap:
                            data.giaNhap === null
                                ? null
                                : Number(
                                    data.giaNhap
                                ),

                        haoHutDuKien:
                            data.haoHutDuKien === null
                                ? null
                                : Number(
                                    data.haoHutDuKien
                                )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maThucPham

            });

    }
);