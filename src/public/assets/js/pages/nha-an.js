"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "nha-an",

        detailTitle:
            "Thông tin nhà ăn",

        createTitle:
            "Thêm nhà ăn",

        updateTitle:
            "Cập nhật nhà ăn",

        columns: [
            {
                key:
                    "maNhaAn",

                label:
                    "Mã nhà ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenNhaAn",

                label:
                    "Tên nhà ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "coSo.ten",

                label:
                    "Cơ sở",

                filterable:
                    true
            },
            {
                key:
                    "diaChi",

                label:
                    "Địa chỉ",

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

                coSoId:
                    Number(
                        data.coSoId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maNhaAn

    });