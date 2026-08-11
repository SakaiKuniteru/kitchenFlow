"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "quoc-gia",

        detailTitle:
            "Thông tin quốc gia",

        createTitle:
            "Thêm quốc gia",

        updateTitle:
            "Cập nhật quốc gia",

        columns: [
            {
                key:
                    "maQuocGia",

                label:
                    "Mã quốc gia",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenQuocGia",

                label:
                    "Tên quốc gia",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenTiengAnh",

                label:
                    "Tên tiếng Anh",

                filterable:
                    true
            },
            {
                key:
                    "maIso2",

                label:
                    "ISO2",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "maIso3",

                label:
                    "ISO3",

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
                record.maQuocGia

    });