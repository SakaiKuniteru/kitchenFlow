"use strict";


window.MCS.pages
    .initializeCatalogPage({

        moduleName:
            "tai-khoan",

        detailTitle:
            "Thông tin tài khoản",

        createTitle:
            "Thêm tài khoản",

        updateTitle:
            "Cập nhật tài khoản",

        columns: [
            {
                key:
                    "tenDangNhap",

                label:
                    "Tên đăng nhập",

                sortable:
                    true,

                filterable:
                    true
            },
            {
                key:
                    "nhanVien.maNhanVien",

                label:
                    "Mã nhân viên",

                filterable:
                    true
            },
            {
                key:
                    "nhanVien.hoTen",

                label:
                    "Họ tên",

                filterable:
                    true
            },
            {
                key:
                    "dsMaVaiTro",

                label:
                    "Vai trò",

                render:
                    value =>
                        Array.isArray(value)
                            ? value.join(", ")
                            : "—"
            },
            {
                key:
                    "lanDangNhapCuoi",

                label:
                    "Đăng nhập cuối",

                type:
                    "datetime",

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

                nhanVienId:
                    Number(
                        data.nhanVienId
                    ),

                dsVaiTroId:
                    window.normalizeNumberArray(
                        data.dsVaiTroId
                    )

            }),

        getRecordSubtitle:
            record =>
                record.tenDangNhap

    });