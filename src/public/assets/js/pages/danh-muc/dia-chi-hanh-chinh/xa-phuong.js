"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "xa-phuong",

        detailTitle:
            "Thông tin xã phường",

        createTitle:
            "Thêm xã phường",

        updateTitle:
            "Cập nhật xã phường",

        columns: [
            {
                key:
                    "maXaPhuong",

                label:
                    "Mã xã phường",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenXaPhuong",

                label:
                    "Tên xã phường",

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
                    "tinhThanh.ten",

                label:
                    "Tỉnh thành",

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

                tinhThanhId:
                    Number(
                        data.tinhThanhId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maXaPhuong

    });