"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "phong-ban",

                detailTitle:
                    "Thông tin phòng ban",

                columns: [
                    {
                        key: "maPhongBan",
                        label: "Mã phòng ban",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenPhongBan",
                        label: "Tên phòng ban",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "coSo.ten",
                        label: "Cơ sở",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: value =>
                            createStatusBadge(value)
                    }
                ],

                getRecordSubtitle:
                    record =>
                        record.maPhongBan,

                transformPayload:
                    data => ({

                        ...data,

                        coSoId:
                            Number(
                                data.coSoId
                            )

                    })

            });

    }
);