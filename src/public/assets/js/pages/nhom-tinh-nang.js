"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "nhom-tinh-nang",

        detailTitle:
            "Thông tin nhóm tính năng",

        createTitle:
            "Thêm nhóm tính năng",

        updateTitle:
            "Cập nhật nhóm tính năng",

        columns: [
            {
                key:
                    "maNhomTinhNang",

                label:
                    "Mã nhóm",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenNhomTinhNang",

                label:
                    "Tên nhóm tính năng",

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
                record.maNhomTinhNang

    });