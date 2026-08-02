"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "vai-tro",

        detailTitle:
            "Thông tin vai trò",

        createTitle:
            "Thêm vai trò",

        updateTitle:
            "Cập nhật vai trò",

        columns: [
            {
                key:
                    "maVaiTro",

                label:
                    "Mã vai trò",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenVaiTro",

                label:
                    "Tên vai trò",

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
                    "dsQuyenId",

                label:
                    "Số quyền",

                render:
                    value =>
                        Array.isArray(value)
                            ? value.length
                            : 0
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

                dsQuyenId:
                    window.normalizeNumberArray(
                        data.dsQuyenId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maVaiTro

    });