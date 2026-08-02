"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "quyen",

        detailTitle:
            "Thông tin quyền",

        createTitle:
            "Thêm quyền",

        updateTitle:
            "Cập nhật quyền",

        columns: [
            {
                key:
                    "maQuyen",

                label:
                    "Mã quyền",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenQuyen",

                label:
                    "Tên quyền",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "nhomTinhNang.ten",

                label:
                    "Nhóm tính năng",

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

        transformPayload:
            data => ({

                ...data,

                nhomTinhNangId:
                    Number(
                        data.nhomTinhNangId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maQuyen

    });