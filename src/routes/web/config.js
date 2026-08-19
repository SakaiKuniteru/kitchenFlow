"use strict";

const danhMucWebController = require( "../../controllers/web/danh-muc.controller" );

const thucDonWebController = require( "../../controllers/web/thuc-don.controller" );

function textColumn(
    key,
    label,
    options = {}
) {

    return {

        key,

        label,

        sortable:
            options.sortable !==
            false,

        searchable:
            options.searchable !==
            false,

        filterable:
            options.filterable !==
            false,

        isBoolean:
            false,

        className:
            options.className ||
            "",

        width:
            options.width ||
            ""

    };

}


function booleanColumn(
    key = "active",
    label = "Hiệu lực",
    options = {}
) {

    return {

        key,

        label,

        sortable:
            options.sortable !==
            false,

        searchable:
            false,

        filterable:
            options.filterable !==
            false,

        isBoolean:
            true,

        type:
            "boolean",

        trueLabel:
            options.trueLabel ||
            "TRUE",

        falseLabel:
            options.falseLabel ||
            "FALSE",

        filterOptions: [
            {
                value:
                    "true",

                label:
                    options.trueLabel ||
                    "TRUE"
            },
            {
                value:
                    "false",

                label:
                    options.falseLabel ||
                    "FALSE"
            }
        ],

        className:
            options.className ||
            "catalog-table__cell--center",

        width:
            options.width ||
            "140px"

    };

}

function numberColumn(
    key,
    label,
    options = {}
) {

    return {

        key,

        label,

        sortable:
            options.sortable !==
            false,

        searchable:
            options.searchable ===
            true,

        filterable:
            options.filterable !==
            false,

        isBoolean:
            false,

        type:
            "number",

        className:
            options.className ||
            "catalog-table__cell--right",

        width:
            options.width ||
            "130px"

    };

}


function createBreadcrumbs(
    group,
    page
) {

    return [
        {
            label:
                "Trang chủ",

            href:
                "/"
        },
        {
            label:
                "Danh mục"
        },
        {
            label:
                group
        },
        {
            label:
                page
        }
    ];

}

function createPage({
    path,
    view,
    title,
    description,
    group,
    page,
    activeSubmenu,
    columns,
    searchPlaceholder,
    showActions = true,
    showFilterRow = true,
    hideCreateButton = false,
    formOptions = {}
}) {

return {

    path,

    view,

    title,

    description,

    activeMenu:
        "danh-muc",

    activeSubmenu,

    columns,

    searchPlaceholder,

    showActions,

    showFilterRow,

    hideCreateButton,

    formOptions,

    breadcrumbs:
        createBreadcrumbs(
            group,
            page
        )

};

}

const danhMucPages = [

    createPage({

        path:
            "/to-chuc/co-so",

        view:
            "pages/danh-muc/to-chuc/co-so/index",

        title:
            "Danh mục cơ sở",

        description:
            "Quản lý danh sách cơ sở trong hệ thống.",

        group:
            "Tổ chức",

        page:
            "Cơ sở",

        activeSubmenu:
            "co-so",

        searchPlaceholder:
            "Tìm theo mã, tên hoặc địa chỉ...",

        columns: [

            textColumn(
                "maCoSo",
                "Mã cơ sở",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenCoSo",
                "Tên cơ sở",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "diaChi",
                "Địa chỉ"
            ),

            textColumn(
                "tenQuocGia",
                "Quốc gia",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenTinhThanh",
                "Tỉnh/Thành",
                {
                    width:
                        "180px"
                }
            ),

            textColumn(
                "tenXaPhuong",
                "Xã/Phường",
                {
                    width:
                        "180px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/to-chuc/phong-ban",

        view:
            "pages/danh-muc/to-chuc/phong-ban/index",

        title:
            "Danh mục phòng ban",

        description:
            "Quản lý phòng ban theo từng cơ sở.",

        group:
            "Tổ chức",

        page:
            "Phòng ban",

        activeSubmenu:
            "phong-ban",

        searchPlaceholder:
            "Tìm theo mã hoặc tên phòng ban...",

        columns: [

            textColumn(
                "maPhongBan",
                "Mã phòng ban",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenPhongBan",
                "Tên phòng ban",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "tenCoSo",
                "Cơ sở",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/to-chuc/chuc-vu",

        view:
            "pages/danh-muc/to-chuc/chuc-vu/index",

        title:
            "Danh mục chức vụ",

        description:
            "Quản lý các chức vụ của nhân viên.",

        group:
            "Tổ chức",

        page:
            "Chức vụ",

        activeSubmenu:
            "chuc-vu",

        columns: [

            textColumn(
                "maChucVu",
                "Mã chức vụ",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenChucVu",
                "Tên chức vụ",
                {
                    width:
                        "240px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/to-chuc/nha-an",

        view:
            "pages/danh-muc/to-chuc/nha-an/index",

        title:
            "Danh mục nhà ăn",

        description:
            "Quản lý danh sách nhà ăn theo cơ sở.",

        group:
            "Tổ chức",

        page:
            "Nhà ăn",

        activeSubmenu:
            "nha-an",

        columns: [

            textColumn(
                "maNhaAn",
                "Mã nhà ăn",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenNhaAn",
                "Tên nhà ăn"
            ),

            textColumn(
                "tenCoSo",
                "Cơ sở",
                {
                    width:
                        "210px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/to-chuc/kho",

        view:
            "pages/danh-muc/to-chuc/kho/index",

        title:
            "Danh mục kho",

        description:
            "Quản lý kho theo từng nhà ăn.",

        group:
            "Tổ chức",

        page:
            "Kho",

        activeSubmenu:
            "kho",

        columns: [

            textColumn(
                "maKho",
                "Mã kho",
                {
                    width:
                        "140px"
                }
            ),

            textColumn(
                "tenKho",
                "Tên kho",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "tenNhaAn",
                "Nhà ăn",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "loaiKhoText",
                "Loại kho",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "diaDiem",
                "Địa điểm",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),

    createPage({

        path:
            "/dia-chi/dia-chi-hanh-chinh",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/tong-hop/index",

        title:
            "Tổng hợp địa chỉ hành chính",

        description:
            "Tra cứu tổng hợp quốc gia, tỉnh thành và xã phường.",

        group:
            "Địa chỉ hành chính",

        page:
            "Tổng hợp",

        activeSubmenu:
            "tong-hop-dia-chi",

        hideCreateButton:
            true,

        columns: [

            textColumn(
                "maDiaChi",
                "Mã địa chỉ",
                {
                    width:
                        "140px"
                }
            ),

            textColumn(
                "tenDiaChi",
                "Tên địa chỉ"
            ),

            textColumn(
                "tenQuocGia",
                "Tên quốc gia",
                {
                    width:
                        "180px"
                }
            ),

            textColumn(
                "tenTiengAnh",
                "Tên tiếng Anh",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "quocGiaTenVietTat",
                "Tên viết tắt QG",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "maIso2",
                "ISO2",
                {
                    width:
                        "90px"
                }
            ),

            textColumn(
                "maIso3",
                "ISO3",
                {
                    width:
                        "90px"
                }
            ),

            textColumn(
                "tenTinhThanh",
                "Tên Tỉnh/TP",
                {
                    width:
                        "190px"
                }
            ),

            textColumn(
                "tinhThanhTenVietTat",
                "Tên viết tắt Tỉnh/TP",
                {
                    width:
                        "190px"
                }
            ),

            textColumn(
                "tenXaPhuong",
                "Tên Xã/Phường",
                {
                    width:
                        "190px"
                }
            ),

            textColumn(
                "xaPhuongTenVietTat",
                "Tên viết tắt Xã/Phường",
                {
                    width:
                        "190px"
                }
            )

        ]

    }),

    createPage({

        path:
            "/dia-chi/quoc-gia",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/quoc-gia/index",

        title:
            "Danh mục quốc gia",

        description:
            "Quản lý danh sách quốc gia.",

        group:
            "Địa chỉ hành chính",

        page:
            "Quốc gia",

        activeSubmenu:
            "quoc-gia",

        columns: [

            textColumn(
                "maQuocGia",
                "Mã quốc gia",
                {
                    width:
                        "140px"
                }
            ),

            textColumn(
                "tenQuocGia",
                "Tên quốc gia"
            ),

            textColumn(
                "tenTiengAnh",
                "Tên tiếng Anh",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "tenVietTat",
                "Tên viết tắt",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "maIso2",
                "ISO2",
                {
                    width:
                        "85px"
                }
            ),

            textColumn(
                "maIso3",
                "ISO3",
                {
                    width:
                        "85px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/dia-chi/tinh-thanh",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/tinh-thanh/index",

        title:
            "Danh mục tỉnh thành",

        description:
            "Quản lý tỉnh thành theo quốc gia.",

        group:
            "Địa chỉ hành chính",

        page:
            "Tỉnh thành",

        activeSubmenu:
            "tinh-thanh",

        columns: [
            textColumn(
                "maTinhThanh",
                "Mã tỉnh thành",
                {
                    width:
                        "160px"
                }
            ),
            textColumn(
                "tenTinhThanh",
                "Tên tỉnh thành"
            ),
            textColumn(
                "tenVietTat",
                "Tên viết tắt"
            ),
            textColumn(
                "tenQuocGia",
                "Quốc gia"
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),


    createPage({

        path:
            "/dia-chi/xa-phuong",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/xa-phuong/index",

        title:
            "Danh mục xã phường",

        description:
            "Quản lý xã phường theo tỉnh thành.",

        group:
            "Địa chỉ hành chính",

        page:
            "Xã phường",

        activeSubmenu:
            "xa-phuong",

        columns: [

            textColumn(
                "maXaPhuong",
                "Mã xã phường",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenXaPhuong",
                "Tên xã phường",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "tenVietTat",
                "Tên viết tắt",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenTinhThanh",
                "Tỉnh thành",
                {
                    width:
                        "200px"
                }
            ),

            textColumn(
                "tenQuocGia",
                "Quốc gia",
                {
                    width:
                        "170px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]
    }),


    createPage({

        path:
            "/suat-an/ca-an",

        view:
            "pages/danh-muc/suat-an/ca-an/index",

        title:
            "Danh mục ca ăn",

        description:
            "Quản lý các ca ăn trong hệ thống.",

        group:
            "Suất ăn",

        page:
            "Ca ăn",

        activeSubmenu:
            "ca-an",

        columns: [
            textColumn(
                "maCaAn",
                "Mã ca ăn",
                {
                    width:
                        "140px"
                }
            ),
            textColumn(
                "tenCaAn",
                "Tên ca ăn"
            ),
            textColumn(
                "gioBatDau",
                "Giờ bắt đầu",
                {
                    width:
                        "130px"
                }
            ),
            textColumn(
                "gioKetThuc",
                "Giờ kết thúc",
                {
                    width:
                        "130px"
                }
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),


    createPage({

        path:
            "/he-thong/nhom-mon-an",

        view:
            "pages/danh-muc/he-thong/nhom-mon-an/index",

        title:
            "Danh mục nhóm món ăn",

        description:
            "Quản lý các nhóm phân loại món ăn.",

        group:
            "Hệ thống",

        page:
            "Nhóm món ăn",

        activeSubmenu:
            "nhom-mon-an",

        columns: [
            textColumn(
                "maNhomMonAn",
                "Mã nhóm món ăn"
            ),
            textColumn(
                "tenNhomMonAn",
                "Tên nhóm món ăn"
            ),
            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),


    createPage({

        path:
            "/suat-an/mon-an",

        view:
            "pages/danh-muc/suat-an/mon-an/index",

        title:
            "Danh mục món ăn",

        description:
            "Quản lý danh sách món ăn.",

        group:
            "Suất ăn",

        page:
            "Món ăn",

        activeSubmenu:
            "mon-an",

        columns: [

            textColumn(
                "maMonAn",
                "Mã món ăn",
                {
                    width:
                        "140px"
                }
            ),

            textColumn(
                "tenMonAn",
                "Tên món ăn",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "tenNhomMonAn",
                "Nhóm món ăn",
                {
                    width:
                        "200px"
                }
            ),

            numberColumn(
                "giaTien",
                "Giá tiền",
                {
                    width:
                        "140px"
                }
            ),

            numberColumn(
                "giaDuKien",
                "Giá dự kiến",
                {
                    width:
                        "150px"
                }
            ),

            numberColumn(
                "calories",
                "Calories",
                {
                    width:
                        "120px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/suat-an/thuc-pham",

        view:
            "pages/danh-muc/suat-an/thuc-pham/index",

        title:
            "Danh mục thực phẩm",

        description:
            "Quản lý thực phẩm, đơn vị và quy cách.",

        group:
            "Suất ăn",

        page:
            "Thực phẩm",

        activeSubmenu:
            "thuc-pham",

        columns: [

            textColumn(
                "maThucPham",
                "Mã thực phẩm",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenThucPham",
                "Tên thực phẩm",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "tenDonViSoCap",
                "Đơn vị sơ cấp",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenDonViSuDung",
                "Đơn vị sử dụng",
                {
                    width:
                        "160px"
                }
            ),

            numberColumn(
                "heSoQuyDoi",
                "Hệ số quy đổi",
                {
                    width:
                        "140px"
                }
            ),

            textColumn(
                "quyCach",
                "Quy cách",
                {
                    width:
                        "180px"
                }
            ),

            numberColumn(
                "giaNhap",
                "Giá nhập",
                {
                    width:
                        "140px"
                }
            ),

            numberColumn(
                "tyLeHaoHutDuKien",
                "Tỷ lệ hao hụt",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "xuatXu",
                "Xuất xứ",
                {
                    width:
                        "180px"
                }
            ),

            textColumn(
                "dieuKienBaoQuan",
                "Điều kiện bảo quản",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            textColumn(
                "ghiChu",
                "Ghi chú",
                {
                    width:
                        "220px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/suat-an/don-vi-tinh",

        view:
            "pages/danh-muc/suat-an/don-vi-tinh/index",

        title:
            "Danh mục đơn vị tính",

        description:
            "Quản lý đơn vị tính và loại đơn vị.",

        group:
            "Suất ăn",

        page:
            "Đơn vị tính",

        activeSubmenu:
            "don-vi-tinh",

        columns: [
            textColumn(
                "maDonViTinh",
                "Mã đơn vị tính"
            ),
            textColumn(
                "tenDonViTinh",
                "Tên đơn vị tính"
            ),
            textColumn(
                "loaiDonViText",
                "Loại đơn vị"
            ),
            textColumn(
                "kyHieu",
                "Ký hiệu"
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),

    createPage({

        path:
            "/to-chuc/nhan-vien",

        view:
            "pages/danh-muc/nhan-su/nhan-vien/index",

        title:
            "Danh mục nhân viên",

        description:
            "Quản lý hồ sơ và thông tin nhân viên.",

        group:
            "Tổ chức",

        page:
            "Nhân viên",

        activeSubmenu:
            "nhan-vien",

    columns: [

        textColumn(
            "maNhanVien",
            "Mã nhân viên",
            {
                width:
                    "150px"
            }
        ),

        textColumn(
            "tenDangNhap",
            "Tên đăng nhập",
            {
                width:
                    "170px"
            }
        ),

        textColumn(
            "hoTen",
            "Họ tên",
            {
                width:
                    "220px"
            }
        ),

        textColumn(
            "email",
            "Email",
            {
                width:
                    "220px"
            }
        ),

        textColumn(
            "soDienThoai",
            "Số điện thoại",
            {
                width:
                    "150px"
            }
        ),

        textColumn(
            "ngaySinh",
            "Ngày sinh",
            {
                width:
                    "130px"
            }
        ),

        textColumn(
            "gioiTinh",
            "Giới tính",
            {
                width:
                    "120px",

                format:
                    value => {

                        const labels = {
                            0: "Nữ",
                            1: "Nam",
                            2: "Khác"
                        };

                        return labels[value] ?? "";
                    }
            }
        ),

        textColumn(
            "tenChucVu",
            "Chức vụ",
            {
                width:
                    "180px"
            }
        ),

        textColumn(
            "tenPhongBan",
            "Phòng ban",
            {
                width:
                    "190px"
            }
        ),

        textColumn(
            "tenCoSo",
            "Cơ sở",
            {
                width:
                    "190px"
            }
        ),

        textColumn(
            "diaChi",
            "Địa chỉ"
        ),

        textColumn(
            "tenQuocGia",
            "Quốc gia",
            {
                width:
                    "160px"
            }
        ),

        textColumn(
            "tenTinhThanh",
            "Tỉnh/Thành",
            {
                width:
                    "180px"
            }
        ),

        textColumn(
            "tenXaPhuong",
            "Xã/Phường",
            {
                width:
                    "180px"
            }
        ),

        textColumn(
            "maThe",
            "Mã thẻ",
            {
                width:
                    "150px"
            }
        ),

        textColumn(
            "ghiChu",
            "Ghi chú",
            {
                width:
                    "220px"
            }
        ),

        booleanColumn(
            "active",
            "Hiệu lực",
            {
                width:
                    "130px"
            }
        )

    ]

    }),


    createPage({

        path:
            "/phan-quyen/tai-khoan",

        view:
            "pages/danh-muc/nhan-su/tai-khoan/index",

        title:
            "Danh mục tài khoản",

        description:
            "Quản lý tài khoản đăng nhập và vai trò.",

        group:
            "Phân quyền",

        page:
            "Tài khoản",

        activeSubmenu:
            "tai-khoan",

        columns: [

            textColumn(
                "maNhanVien",
                "Mã nhân viên",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenDangNhap",
                "Tên đăng nhập",
                {
                    width:
                        "170px"
                }
            ),

            textColumn(
                "hoTenNhanVien",
                "Tên nhân viên"
            ),

            numberColumn(
                "soLanDangNhapSai",
                "Số lần nhập sai",
                {
                    width:
                        "150px"
                }
            ),

            booleanColumn(
                "biKhoa",
                "Bị khóa",
                {
                    width:
                        "120px"
                }
            ),

            textColumn(
                "khoaDen",
                "Khóa đến",
                {
                    width:
                        "170px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/phan-quyen/vai-tro",

        view:
            "pages/danh-muc/he-thong/vai-tro/index",

        title:
            "Danh mục vai trò",

        description:
            "Quản lý vai trò và danh sách quyền.",

        group:
            "Phân quyền",

        page:
            "Vai trò",

        activeSubmenu:
            "vai-tro",

        columns: [
            textColumn(
                "maVaiTro",
                "Mã vai trò"
            ),
            textColumn(
                "tenVaiTro",
                "Tên vai trò"
            ),
            textColumn(
                "moTa",
                "Mô tả"
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),


    createPage({

        path:
            "/phan-quyen/quyen",

        view:
            "pages/danh-muc/he-thong/quyen/index",

        title:
            "Danh mục quyền",

        description:
            "Quản lý quyền truy cập chức năng.",

        group:
            "Phân quyền",

        page:
            "Quyền",

        activeSubmenu:
            "quyen",

        columns: [
            textColumn(
                "maQuyen",
                "Mã quyền"
            ),
            textColumn(
                "tenQuyen",
                "Tên quyền"
            ),
            textColumn(
                "tenNhomTinhNang",
                "Nhóm tính năng"
            ),
            textColumn(
                "moTa",
                "Mô tả"
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),


    createPage({

        path:
            "/he-thong/nhom-tinh-nang",

        view:
            "pages/danh-muc/he-thong/nhom-tinh-nang/index",

        title:
            "Danh mục nhóm tính năng",

        description:
            "Phân nhóm các quyền và chức năng hệ thống.",

        group:
            "Hệ thống",

        page:
            "Nhóm tính năng",

        activeSubmenu:
            "nhom-tinh-nang",

        columns: [
            textColumn(
                "maNhomTinhNang",
                "Mã nhóm"
            ),
            textColumn(
                "tenNhomTinhNang",
                "Tên nhóm tính năng"
            ),
            textColumn(
                "moTa",
                "Mô tả"
            ),
            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )
        ]

    }),

    createPage({

        path:
            "/chuong-trinh/voucher",

        view:
            "pages/danh-muc/chinh-sach/voucher/index",

        title:
            "Danh mục voucher",

        description:
            "Quản lý voucher và giá trị miễn giảm.",

        group:
            "Chính sách",

        page:
            "Voucher",

        activeSubmenu:
            "voucher",

        columns: [

            textColumn(
                "maVoucher",
                "Mã voucher",
                {
                    width:
                        "150px"
                }
            ),

            textColumn(
                "tenVoucher",
                "Tên voucher"
            ),

            textColumn(
                "loaiMienGiamText",
                "Loại",
                {
                    width:
                        "170px"
                }
            ),

            numberColumn(
                "giaTri",
                "Giá trị",
                {
                    width:
                        "140px"
                }
            ),

            numberColumn(
                "soLuong",
                "Số lượng",
                {
                    width:
                        "120px"
                }
            ),

            booleanColumn(
                "active",
                "Trạng thái",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/chuong-trinh/chinh-sach",

        view:
            "pages/danh-muc/chinh-sach/chinh-sach/index",

        title:
            "Danh mục chính sách",

        description:
            "Quản lý các chính sách trong hệ thống.",

        group:
            "Chính sách",

        page:
            "Chính sách",

        activeSubmenu:
            "chinh-sach",

        columns: [

            textColumn(
                "maChinhSach",
                "Mã chính sách",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "tenChinhSach",
                "Tên chính sách",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "loaiChinhSachText",
                "Loại chính sách",
                {
                    width:
                        "180px"
                }
            ),

            textColumn(
                "tenVoucher",
                "Tên voucher",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Trạng thái",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),


    createPage({

        path:
            "/he-thong/thiet-lap",

        view:
            "pages/danh-muc/he-thong/thiet-lap/index",

        title:
            "Thiết lập hệ thống",

        description:
            "Quản lý các tham số cấu hình của MCS KitchenFlow.",

        group:
            "Hệ thống",

        page:
            "Thiết lập",

        activeSubmenu:
            "thiet-lap",

        columns: [

            textColumn(
                "maThietLap",
                "Mã thiết lập",
                {
                    width:
                        "230px"
                }
            ),

            textColumn(
                "tenThietLap",
                "Tên thiết lập",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "giaTri",
                "Giá trị",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "nhomTinhNang",
                "Nhóm tính năng",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    }),

    createPage({

        path:
            "/he-thong/bao-cao",

        view:
            "pages/danh-muc/he-thong/bao-cao/index",

        title:
            "Danh mục báo cáo",

        description:
            "Quản lý các báo cáo trong hệ thống.",

        group:
            "Hệ thống",

        page:
            "Báo cáo",

        activeSubmenu:
            "bao-cao",

       formOptions: {

            loaiXuatFile: [
                {
                    value: "10",
                    label: "Excel"
                },
                {
                    value: "20",
                    label: "PDF"
                },
                {
                    value: "30",
                    label: "Word"
                }
            ]

        },
        columns: [

            textColumn(
                "maThietLap",
                "Mã thiết lập",
                {
                    width:
                        "230px"
                }
            ),

            textColumn(
                "tenThietLap",
                "Tên thiết lập",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "giaTri",
                "Giá trị",
                {
                    width:
                        "160px"
                }
            ),

            textColumn(
                "nhomTinhNang",
                "Nhóm tính năng",
                {
                    width:
                        "180px"
                }
            ),

            textColumn(
                "moTa",
                "Mô tả",
                {
                    width:
                        "250px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực",
                {
                    width:
                        "130px"
                }
            )

        ]

    })

];

const danhMucRoutes =
    danhMucPages.map(
        page => ({

            method:
                "get",

            path:
                page.path,

            handler:
                danhMucWebController
                    .renderPage(
                        page
                    )

        })
    );


const thucDonRoutes = [

    {
        method:
            "get",

        path:
            "/thuc-don/danh-sach-thuc-don",

        handler:
            thucDonWebController.danhSach
    },

    {
        method:
            "get",

        path:
            "/thuc-don/them-moi-thuc-don",

        handler:
            thucDonWebController.themMoi
    },

    {
        method:
            "get",

        path:
            "/thuc-don/thong-tin-chi-tiet-thuc-don/:id",

        handler:
            thucDonWebController.chiTiet
    },

    {
        method:
            "get",

        path:
            "/thuc-don/cap-nhat-thong-tin-thuc-don/:id",

        handler:
            thucDonWebController.capNhat
    }

];


const webRoutes = [
    ...danhMucRoutes,
    ...thucDonRoutes
];


module.exports =
    webRoutes;