"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "mon-an",

        detailTitle:
            "Thông tin món ăn",

        createTitle:
            "Thêm món ăn",

        updateTitle:
            "Cập nhật món ăn",

        columns: [
            {
                key:
                    "maMonAn",

                label:
                    "Mã món ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenMonAn",

                label:
                    "Tên món ăn",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "nhomMonAn.ten",

                label:
                    "Nhóm món ăn",

                filterable:
                    true
            },
            {
                key:
                    "giaTien",

                label:
                    "Giá tiền",

                type:
                    "currency",

                sortable:
                    true
            },
            {
                key:
                    "giaDuKien",

                label:
                    "Giá dự kiến",

                type:
                    "currency",

                sortable:
                    true
            },
            {
                key:
                    "calories",

                label:
                    "Calories",

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
                        className: "catalog-table__cell--center",

                render:
                    window.createStatusBadge
            }
        ],

        transformPayload:
            data => ({

                ...data,

                nhomMonAnId:
                    Number(
                        data.nhomMonAnId
                    ),

                giaTien:
                    data.giaTien ===
                        null ||
                    data.giaTien ===
                        ""
                        ? null
                        : Number(
                            data.giaTien
                        ),

                giaDuKien:
                    data.giaDuKien ===
                        null ||
                    data.giaDuKien ===
                        ""
                        ? null
                        : Number(
                            data.giaDuKien
                        ),

                calories:
                    data.calories ===
                        null ||
                    data.calories ===
                        ""
                        ? null
                        : Number(
                            data.calories
                        )

            }),

        getRecordSubtitle:
            record =>
                record.maMonAn

    });