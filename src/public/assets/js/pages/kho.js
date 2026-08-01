"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "kho",

                detailTitle:
                    "Thông tin kho",

                columns: [
                    {
                        key: "maKho",
                        label: "Mã kho",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenKho",
                        label: "Tên kho",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "nhaAn.ten",
                        label: "Nhà ăn",
                        filterable: true
                    },
                    {
                        key: "loaiKho",
                        label: "Loại kho",
                        sortable: true
                    },
                    {
                        key: "nhietDoToiThieu",
                        label: "Nhiệt độ tối thiểu",
                        type: "number"
                    },
                    {
                        key: "nhietDoToiDa",
                        label: "Nhiệt độ tối đa",
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

                        nhaAnId:
                            Number(
                                data.nhaAnId
                            ),

                        loaiKho:
                            Number(
                                data.loaiKho
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maKho

            });

    }
);