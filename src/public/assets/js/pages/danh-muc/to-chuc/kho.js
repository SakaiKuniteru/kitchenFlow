"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "kho",

        detailTitle:
            "Thông tin kho",

        createTitle:
            "Thêm kho",

        updateTitle:
            "Cập nhật kho",

        columns: [
            {
                key:
                    "maKho",

                label:
                    "Mã kho",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenKho",

                label:
                    "Tên kho",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "nhaAn.ten",

                label:
                    "Nhà ăn",

                filterable:
                    true
            },
            {
                key:
                    "loaiKho",

                label:
                    "Loại kho",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "nhietDoToiThieu",

                label:
                    "Nhiệt độ tối thiểu",

                type:
                    "number",

                sortable:
                    true
            },
            {
                key:
                    "nhietDoToiDa",

                label:
                    "Nhiệt độ tối đa",

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

                nhaAnId:
                    Number(
                        data.nhaAnId
                    ),

                loaiKho:
                    Number(
                        data.loaiKho
                    ),

                nhietDoToiThieu:
                    data.nhietDoToiThieu ===
                        null ||
                    data.nhietDoToiThieu ===
                        ""
                        ? null
                        : Number(
                            data.nhietDoToiThieu
                        ),

                nhietDoToiDa:
                    data.nhietDoToiDa ===
                        null ||
                    data.nhietDoToiDa ===
                        ""
                        ? null
                        : Number(
                            data.nhietDoToiDa
                        )

            }),

        getRecordSubtitle:
            record =>
                record.maKho

    });