"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "chinh-sach",

        detailTitle:
            "Thông tin chính sách",

        createTitle:
            "Thêm chính sách",

        updateTitle:
            "Cập nhật chính sách",

        columns: [
            {
                key:
                    "maChinhSach",

                label:
                    "Mã chính sách",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenChinhSach",

                label:
                    "Tên chính sách",

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
                        className: "catalog-table__cell--center",

                render:
                    window.createStatusBadge
            }
        ],

        getRecordSubtitle:
            record =>
                record.maChinhSach

    });