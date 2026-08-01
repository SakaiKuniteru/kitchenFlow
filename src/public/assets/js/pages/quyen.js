"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "quyen",

                detailTitle:
                    "Thông tin quyền",

                columns: [
                    {
                        key: "maQuyen",
                        label: "Mã quyền",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenQuyen",
                        label: "Tên quyền",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "nhomTinhNang.ten",
                        label: "Nhóm tính năng",
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

                        nhomTinhNangId:
                            Number(
                                data.nhomTinhNangId
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maQuyen

            });

    }
);