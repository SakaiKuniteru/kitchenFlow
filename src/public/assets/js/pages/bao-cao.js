"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "bao-cao",

        detailTitle:
            "Thông tin báo cáo",

        createTitle:
            "Thêm báo cáo",

        updateTitle:
            "Cập nhật báo cáo",

        columns: [
            {
                key:
                    "maBaoCao",

                label:
                    "Mã báo cáo",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenBaoCao",

                label:
                    "Tên báo cáo",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "loaiXuatFileText",

                label:
                    "Loại xuất file",

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
                record.maBaoCao

    });