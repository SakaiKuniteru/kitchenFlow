"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "co-so",

        detailTitle:
            "Thông tin cơ sở",

        createTitle:
            "Thêm cơ sở",

        updateTitle:
            "Cập nhật cơ sở",

        columns: [
            {
                key:
                    "maCoSo",

                label:
                    "Mã cơ sở",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "tenCoSo",

                label:
                    "Tên cơ sở",

                sortable:
                    true,

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

        getRecordSubtitle:
            record =>
                record.maCoSo,

        transformPayload:
            data => ({

                ...data,

                quocGiaId:
                    data.quocGiaId
                        ? Number(
                            data.quocGiaId
                        )
                        : null,

                tinhThanhId:
                    data.tinhThanhId
                        ? Number(
                            data.tinhThanhId
                        )
                        : null,

                xaPhuongId:
                    data.xaPhuongId
                        ? Number(
                            data.xaPhuongId
                        )
                        : null

            })

    });