"use strict";


const danhMucWebController = require( "../../controllers/web/danh-muc.controller" );


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
    label = "Hiệu lực"
) {

    return {

        key,

        label,

        sortable:
            true,

        searchable:
            false,

        filterable:
            true,

        filterOptions: [
            {
                value: "true",
                label: "Đang hoạt động"
            },
            {
                value: "false",
                label: "Đã khóa"
            }
        ],

        className:
            "catalog-table__cell--center",

        width:
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
            "/danh-muc/co-so",

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
                "Tên cơ sở"
            ),
            textColumn(
                "diaChi",
                "Địa chỉ"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/phong-ban",

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
                "Tên phòng ban"
            ),
            textColumn(
                "tenCoSo",
                "Cơ sở"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/chuc-vu",

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
                "Tên chức vụ"
            ),
            textColumn(
                "ghiChu",
                "Ghi chú"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/nha-an",

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
                "Cơ sở"
            ),
            numberColumn(
                "sucChua",
                "Sức chứa"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/kho",

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
                "Tên kho"
            ),
            textColumn(
                "tenNhaAn",
                "Nhà ăn"
            ),
            textColumn(
                "viTri",
                "Vị trí"
            ),
            booleanColumn()
        ]

    }),

    createPage({

        path:
            "/danh-muc/dia-chi-hanh-chinh",

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
                "loaiDiaChi",
                "Loại",
                {
                    width:
                        "120px"
                }
            ),

            textColumn(
                "maDiaChi",
                "Mã",
                {
                    width:
                        "130px"
                }
            ),

            textColumn(
                "tenDiaChi",
                "Tên địa chỉ"
            ),

            textColumn(
                "tenTinhThanh",
                "Tỉnh/Thành phố",
                {
                    width:
                        "220px"
                }
            ),

            textColumn(
                "tenQuocGia",
                "Quốc gia",
                {
                    width:
                        "150px"
                }
            ),

            booleanColumn(
                "active",
                "Hiệu lực"
            )
        ]

    }),


    createPage({

        path:
            "/danh-muc/quoc-gia",

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
                        "150px"
                }
            ),
            textColumn(
                "tenQuocGia",
                "Tên quốc gia"
            ),
            textColumn(
                "tenTiengAnh",
                "Tên tiếng Anh"
            ),
            textColumn(
                "maIso2",
                "ISO2",
                {
                    width:
                        "100px"
                }
            ),
            textColumn(
                "maIso3",
                "ISO3",
                {
                    width:
                        "100px"
                }
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/tinh-thanh",

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
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/xa-phuong",

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
                "Tên xã phường"
            ),
            textColumn(
                "tenVietTat",
                "Tên viết tắt"
            ),
            textColumn(
                "tenTinhThanh",
                "Tỉnh thành"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/ca-an",

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
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/nhom-mon-an",

        view:
            "pages/danh-muc/he-thong/nhom-mon-an/index",

        title:
            "Danh mục nhóm món ăn",

        description:
            "Quản lý các nhóm phân loại món ăn.",

        group:
            "Suất ăn",

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
                "Mô tả"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/mon-an",

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
                "Mã món ăn"
            ),
            textColumn(
                "tenMonAn",
                "Tên món ăn"
            ),
            textColumn(
                "tenNhomMonAn",
                "Nhóm món ăn"
            ),
            numberColumn(
                "donGia",
                "Đơn giá"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/thuc-pham",

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
                "Mã thực phẩm"
            ),
            textColumn(
                "tenThucPham",
                "Tên thực phẩm"
            ),
            textColumn(
                "tenDonViTinh",
                "Đơn vị tính"
            ),
            textColumn(
                "quyCach",
                "Quy cách"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/don-vi-tinh",

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
            booleanColumn()
        ]

    }),

    createPage({

        path:
            "/danh-muc/nhan-vien",

        view:
            "pages/danh-muc/nhan-su/nhan-vien/index",

        title:
            "Danh mục nhân viên",

        description:
            "Quản lý hồ sơ và thông tin nhân viên.",

        group:
            "Nhân sự",

        page:
            "Nhân viên",

        activeSubmenu:
            "nhan-vien",

        columns: [
            textColumn(
                "maNhanVien",
                "Mã nhân viên"
            ),
            textColumn(
                "hoTen",
                "Họ tên"
            ),
            textColumn(
                "tenCoSo",
                "Cơ sở"
            ),
            textColumn(
                "tenPhongBan",
                "Phòng ban"
            ),
            textColumn(
                "tenChucVu",
                "Chức vụ"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/tai-khoan",

        view:
            "pages/danh-muc/nhan-su/tai-khoan/index",

        title:
            "Danh mục tài khoản",

        description:
            "Quản lý tài khoản đăng nhập và vai trò.",

        group:
            "Nhân sự",

        page:
            "Tài khoản",

        activeSubmenu:
            "tai-khoan",

        columns: [
            textColumn(
                "tenDangNhap",
                "Tên đăng nhập"
            ),
            textColumn(
                "hoTenNhanVien",
                "Nhân viên"
            ),
            textColumn(
                "tenVaiTro",
                "Vai trò"
            ),
            textColumn(
                "lanDangNhapCuoi",
                "Đăng nhập cuối"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/vai-tro",

        view:
            "pages/danh-muc/he-thong/vai-tro/index",

        title:
            "Danh mục vai trò",

        description:
            "Quản lý vai trò và danh sách quyền.",

        group:
            "Nhân sự",

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
            numberColumn(
                "soLuongQuyen",
                "Số quyền"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/quyen",

        view:
            "pages/danh-muc/he-thong/quyen/index",

        title:
            "Danh mục quyền",

        description:
            "Quản lý quyền truy cập chức năng.",

        group:
            "Nhân sự",

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
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/nhom-tinh-nang",

        view:
            "pages/danh-muc/he-thong/nhom-tinh-nang/index",

        title:
            "Danh mục nhóm tính năng",

        description:
            "Phân nhóm các quyền và chức năng hệ thống.",

        group:
            "Nhân sự",

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
            numberColumn(
                "thuTu",
                "Thứ tự"
            ),
            booleanColumn()
        ]

    }),

    createPage({

        path:
            "/danh-muc/voucher",

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
                "Mã voucher"
            ),
            textColumn(
                "tenVoucher",
                "Tên voucher"
            ),
            textColumn(
                "loaiVoucherText",
                "Loại voucher"
            ),
            numberColumn(
                "giaTri",
                "Giá trị"
            ),
            textColumn(
                "ngayKetThuc",
                "Ngày kết thúc"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/chinh-sach",

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
                "Mã chính sách"
            ),
            textColumn(
                "tenChinhSach",
                "Tên chính sách"
            ),
            textColumn(
                "loaiChinhSachText",
                "Loại chính sách"
            ),
            textColumn(
                "ngayBatDau",
                "Ngày bắt đầu"
            ),
            textColumn(
                "ngayKetThuc",
                "Ngày kết thúc"
            ),
            booleanColumn()
        ]

    }),


    createPage({

        path:
            "/danh-muc/thiet-lap",

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
                "Mã thiết lập"
            ),
            textColumn(
                "tenThietLap",
                "Tên thiết lập"
            ),
            textColumn(
                "giaTri",
                "Giá trị"
            ),
            textColumn(
                "moTa",
                "Mô tả"
            ),
            booleanColumn()
        ]

    }),

    createPage({

        path:
            "/danh-muc/bao-cao",

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
                "maBaoCao",
                "Mã báo cáo",
                {
                    width:
                        "160px"
                }
            ),
            textColumn(
                "tenBaoCao",
                "Tên báo cáo"
            ),
            textColumn(
                "loaiXuatFileText",
                "Loại xuất file"
            ),
            textColumn(
                "moTa",
                "Mô tả"
            ),
            booleanColumn()
        ]

    })

];


const webRoutes =
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


module.exports =
    webRoutes;