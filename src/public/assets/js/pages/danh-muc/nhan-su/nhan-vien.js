"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "nhan-vien",

        detailTitle:
            "Thông tin nhân viên",

        createTitle:
            "Thêm nhân viên",

        updateTitle:
            "Cập nhật nhân viên",

        columns: [
            {
                key:
                    "maNhanVien",

                label:
                    "Mã nhân viên",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "hoTen",

                label:
                    "Họ tên",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "soDienThoai",

                label:
                    "Số điện thoại",

                filterable:
                    true
            },
            {
                key:
                    "email",

                label:
                    "Email",

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
                    "phongBan.ten",

                label:
                    "Phòng ban",

                filterable:
                    true
            },
            {
                key:
                    "chucVu.ten",

                label:
                    "Chức vụ",

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
                    ),

                phongBanId:
                    Number(
                        data.phongBanId
                    ),

                chucVuId:
                    Number(
                        data.chucVuId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.maNhanVien

    });