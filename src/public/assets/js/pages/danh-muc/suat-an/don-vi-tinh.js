"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "don-vi-tinh",

        detailTitle:
            "Thông tin đơn vị tính",

        createTitle:
            "Thêm đơn vị tính",

        updateTitle:
            "Cập nhật đơn vị tính",

        columns: [
            {
                key:
                    "maDonViTinh",

                label:
                    "Mã đơn vị",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenDonViTinh",

                label:
                    "Tên đơn vị",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "kyHieu",

                label:
                    "Ký hiệu",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "loaiDonVi",

                label:
                    "Loại đơn vị",

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
                        className: "catalog-table__cell--center",

                render:
                    window.createStatusBadge
            }
        ],

        transformPayload:
            data => ({

                ...data,

                loaiDonVi:
                    Number(
                        data.loaiDonVi
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maDonViTinh

    });