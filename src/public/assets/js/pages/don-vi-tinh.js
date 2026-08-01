"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "don-vi-tinh",

                detailTitle:
                    "Thông tin đơn vị tính",

                columns: [
                    {
                        key: "maDonViTinh",
                        label: "Mã đơn vị",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenDonViTinh",
                        label: "Tên đơn vị",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "kyHieu",
                        label: "Ký hiệu",
                        sortable: true
                    },
                    {
                        key: "loaiDonVi",
                        label: "Loại đơn vị",
                        sortable: true
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

                        loaiDonVi:
                            Number(
                                data.loaiDonVi
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maDonViTinh

            });

    }
);