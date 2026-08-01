"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "tai-khoan",

                detailTitle:
                    "Thông tin tài khoản",

                columns: [
                    {
                        key: "tenDangNhap",
                        label: "Tên đăng nhập",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "nhanVien.maNhanVien",
                        label: "Mã nhân viên",
                        filterable: true
                    },
                    {
                        key: "nhanVien.hoTen",
                        label: "Họ tên",
                        filterable: true
                    },
                    {
                        key: "dsMaVaiTro",
                        label: "Vai trò",
                        render:
                            value =>
                                Array.isArray(value)
                                    ? value.join(", ")
                                    : "—"
                    },
                    {
                        key: "lanDangNhapCuoi",
                        label: "Đăng nhập cuối",
                        type: "datetime",
                        sortable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
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
                            normalizeNumberArray(
                                data.dsVaiTroId
                            )

                    }),

                getRecordSubtitle:
                    record =>
                        record.tenDangNhap

            });

    }
);