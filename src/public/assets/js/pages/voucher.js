"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "voucher",

        detailTitle:
            "Thông tin voucher",

        createTitle:
            "Thêm voucher",

        updateTitle:
            "Cập nhật voucher",

        columns: [
            {
                key:
                    "maVoucher",

                label:
                    "Mã voucher",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenVoucher",

                label:
                    "Tên voucher",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "giaTri",

                label:
                    "Giá trị",

                type:
                    "currency",

                sortable:
                    true
            },
            {
                key:
                    "ngayBatDau",

                label:
                    "Ngày bắt đầu",

                type:
                    "date",

                sortable:
                    true
            },
            {
                key:
                    "ngayKetThuc",

                label:
                    "Ngày kết thúc",

                type:
                    "date",

                sortable:
                    true
            },
            {
                key:
                    "active",

                label:
                    "Trạng thái",

                sortable:
                    true,

                render:
                    window.createStatusBadge
            }
        ],

        getRecordSubtitle:
            record =>
                record.maVoucher

    });