"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "phong-ban",

        detailTitle:
            "Thông tin phòng ban",

        createTitle:
            "Thêm phòng ban",

        updateTitle:
            "Cập nhật phòng ban",

        columns: [
            {
                key:
                    "maPhongBan",

                label:
                    "Mã phòng ban",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenPhongBan",

                label:
                    "Tên phòng ban",

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

        getRecordSubtitle:
            record =>
                record.maPhongBan,

        transformPayload:
            data => ({

                ...data,

                coSoId:
                    Number(
                        data.coSoId
                    )

            })

    });