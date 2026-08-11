"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "nhom-mon-an",

        detailTitle:
            "Thông tin nhóm món ăn",

        createTitle:
            "Thêm nhóm món ăn",

        updateTitle:
            "Cập nhật nhóm món ăn",

        columns: [
            {
                key:
                    "maNhomMonAn",

                label:
                    "Mã nhóm",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenNhomMonAn",

                label:
                    "Tên nhóm món ăn",

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
                record.maNhomMonAn

    });