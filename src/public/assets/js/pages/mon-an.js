"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "mon-an",

                detailTitle:
                    "Thông tin món ăn",

                columns: [
                    {
                        key: "maMonAn",
                        label: "Mã món ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenMonAn",
                        label: "Tên món ăn",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "nhomMonAn.ten",
                        label: "Nhóm món ăn",
                        filterable: true
                    },
                    {
                        key: "giaTien",
                        label: "Giá tiền",
                        type: "currency",
                        sortable: true
                    },
                    {
                        key: "giaDuKien",
                        label: "Giá dự kiến",
                        type: "currency",
                        sortable: true
                    },
                    {
                        key: "calories",
                        label: "Calories",
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

                        nhomMonAnId:
                            Number(
                                data.nhomMonAnId
                            ),

                        giaTien:
                            data.giaTien === null
                                ? null
                                : Number(
                                    data.giaTien
                                ),

                        giaDuKien:
                            Number(
                                data.giaDuKien
                            ),

                        calories:
                            data.calories === null
                                ? null
                                : Number(
                                    data.calories
                                )

                    }),

                getRecordSubtitle:
                    record =>
                        record.maMonAn

            });

    }
);