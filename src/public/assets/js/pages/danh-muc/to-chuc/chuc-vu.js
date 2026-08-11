"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "chuc-vu",

        detailTitle:
            "Thông tin chức vụ",

        createTitle:
            "Thêm chức vụ",

        updateTitle:
            "Cập nhật chức vụ",

        columns: [
            {
                key:
                    "maChucVu",

                label:
                    "Mã chức vụ",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenChucVu",

                label:
                    "Tên chức vụ",

                sortable:
                    true,

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
                record.maChucVu

    });