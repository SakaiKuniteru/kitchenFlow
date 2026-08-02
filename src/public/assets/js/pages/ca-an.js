"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "ca-an",

        detailTitle:
            "Thông tin ca ăn",

        createTitle:
            "Thêm ca ăn",

        updateTitle:
            "Cập nhật ca ăn",

        columns: [
            {
                key:
                    "maCaAn",

                label:
                    "Mã ca ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenCaAn",

                label:
                    "Tên ca ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "thoiGianBatDau",

                label:
                    "Thời gian bắt đầu",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "thoiGianKetThuc",

                label:
                    "Thời gian kết thúc",

                sortable:
                    true,

                filterable:
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
                record.maCaAn

    });