"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "thiet-lap",

        detailTitle:
            "Thông tin thiết lập",

        createTitle:
            "Thêm thiết lập",

        updateTitle:
            "Cập nhật thiết lập",

        columns: [
            {
                key:
                    "maThietLap",

                label:
                    "Mã thiết lập",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenThietLap",

                label:
                    "Tên thiết lập",

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

                filterable:
                    true
            },
            {
                key:
                    "moTa",

                label:
                    "Mô tả",

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
                record.maThietLap

    });