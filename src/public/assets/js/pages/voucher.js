"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "voucher",

                detailTitle:
                    "Thông tin voucher",

                columns: [
                    {
                        key: "maVoucher",
                        label: "Mã voucher",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "tenVoucher",
                        label: "Tên voucher",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "giaTri",
                        label: "Giá trị",
                        type: "currency",
                        sortable: true
                    },
                    {
                        key: "ngayBatDau",
                        label: "Ngày bắt đầu",
                        type: "date",
                        sortable: true
                    },
                    {
                        key: "ngayKetThuc",
                        label: "Ngày kết thúc",
                        type: "date",
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
                        record.maVoucher

            });

    }
);