"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.MCS.pages
            .createCatalogPage({

                moduleName:
                    "nhan-vien",

                detailTitle:
                    "Thông tin nhân viên",

                columns: [
                    {
                        key: "maNhanVien",
                        label: "Mã nhân viên",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "hoTen",
                        label: "Họ tên",
                        sortable: true,
                        filterable: true
                    },
                    {
                        key: "soDienThoai",
                        label: "Số điện thoại",
                        filterable: true
                    },
                    {
                        key: "email",
                        label: "Email",
                        filterable: true
                    },
                    {
                        key: "coSo.ten",
                        label: "Cơ sở",
                        filterable: true
                    },
                    {
                        key: "phongBan.ten",
                        label: "Phòng ban",
                        filterable: true
                    },
                    {
                        key: "chucVu.ten",
                        label: "Chức vụ",
                        filterable: true
                    },
                    {
                        key: "active",
                        label: "Trạng thái",
                        render: createStatusBadge
                    }
                ],

                getRecordSubtitle:
                    record =>
                        record.maNhanVien

            });

    }
);