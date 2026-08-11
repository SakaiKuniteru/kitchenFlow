"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "tinh-thanh",

        detailTitle:
            "Thông tin tỉnh thành",

        createTitle:
            "Thêm tỉnh thành",

        updateTitle:
            "Cập nhật tỉnh thành",

        columns: [
            {
                key:
                    "maTinhThanh",

                label:
                    "Mã tỉnh thành",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenTinhThanh",

                label:
                    "Tên tỉnh thành",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenVietTat",

                label:
                    "Tên viết tắt",

                filterable:
                    true
            },
            {
                key:
                    "quocGia.ten",

                label:
                    "Quốc gia",

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

                quocGiaId:
                    Number(
                        data.quocGiaId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maTinhThanh

    });