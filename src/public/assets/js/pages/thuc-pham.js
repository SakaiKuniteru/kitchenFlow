"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "thuc-pham",

        detailTitle:
            "Thông tin thực phẩm",

        createTitle:
            "Thêm thực phẩm",

        updateTitle:
            "Cập nhật thực phẩm",

        columns: [
            {
                key:
                    "maThucPham",

                label:
                    "Mã thực phẩm",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenThucPham",

                label:
                    "Tên thực phẩm",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "quyCach",

                label:
                    "Quy cách",

                filterable:
                    true
            },
            {
                key:
                    "giaNhap",

                label:
                    "Giá nhập",

                type:
                    "currency",

                sortable:
                    true,

                className:
                    "catalog-table__cell--right"
            },
            {
                key:
                    "haoHutDuKien",

                label:
                    "Hao hụt dự kiến",

                type:
                    "number",

                sortable:
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

                donViSoCapId:
                    Number(
                        data.donViSoCapId
                    ),

                donViSuDungId:
                    Number(
                        data.donViSuDungId
                    ),

                heSoQuyDoi:
                    Number(
                        data.heSoQuyDoi
                    ),

                giaNhap:
                    data.giaNhap ===
                        null ||
                    data.giaNhap ===
                        ""
                        ? null
                        : Number(
                            data.giaNhap
                        ),

                haoHutDuKien:
                    data.haoHutDuKien ===
                        null ||
                    data.haoHutDuKien ===
                        ""
                        ? null
                        : Number(
                            data.haoHutDuKien
                        )

            }),

        getRecordSubtitle:
            record =>
                record.maThucPham

    });