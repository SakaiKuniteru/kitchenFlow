const danhMucWebController =
    require(
        "../../controllers/web/danh-muc.controller"
    );


const danhMucPages = [

    // =====================================================
    // TỔ CHỨC
    // =====================================================

    {
        path:
            "/danh-muc/to-chuc/co-so",

        view:
            "pages/danh-muc/to-chuc/co-so/index",

        title:
            "Danh mục cơ sở",

        description:
            "Quản lý danh sách cơ sở trong hệ thống.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "co-so",

        breadcrumbs: [
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
                    "Tổ chức"
            },
            {
                label:
                    "Cơ sở"
            }
        ]
    },

    {
        path:
            "/danh-muc/to-chuc/phong-ban",

        view:
            "pages/danh-muc/to-chuc/phong-ban/index",

        title:
            "Danh mục phòng ban",

        description:
            "Quản lý phòng ban theo từng cơ sở.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "phong-ban",

        breadcrumbs: [
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
                    "Tổ chức"
            },
            {
                label:
                    "Phòng ban"
            }
        ]
    },

    {
        path:
            "/danh-muc/to-chuc/chuc-vu",

        view:
            "pages/danh-muc/to-chuc/chuc-vu/index",

        title:
            "Danh mục chức vụ",

        description:
            "Quản lý các chức vụ của nhân viên.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "chuc-vu",

        breadcrumbs: [
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
                    "Tổ chức"
            },
            {
                label:
                    "Chức vụ"
            }
        ]
    },

    {
        path:
            "/danh-muc/to-chuc/nha-an",

        view:
            "pages/danh-muc/to-chuc/nha-an/index",

        title:
            "Danh mục nhà ăn",

        description:
            "Quản lý danh sách nhà ăn theo cơ sở.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "nha-an",

        breadcrumbs: [
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
                    "Tổ chức"
            },
            {
                label:
                    "Nhà ăn"
            }
        ]
    },

    {
        path:
            "/danh-muc/to-chuc/kho",

        view:
            "pages/danh-muc/to-chuc/kho/index",

        title:
            "Danh mục kho",

        description:
            "Quản lý kho theo từng nhà ăn.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "kho",

        breadcrumbs: [
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
                    "Tổ chức"
            },
            {
                label:
                    "Kho"
            }
        ]
    },

    // =====================================================
    // ĐỊA CHỈ HÀNH CHÍNH
    // =====================================================

    {
        path:
            "/danh-muc/dia-chi-hanh-chinh/tong-hop",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/tong-hop/index",

        title:
            "Tổng hợp địa chỉ hành chính",

        description:
            "Tra cứu tổng hợp quốc gia, tỉnh thành và xã phường.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "tong-hop-dia-chi",

        breadcrumbs: [
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
                    "Địa chỉ hành chính"
            },
            {
                label:
                    "Tổng hợp"
            }
        ]
    },

    {
        path:
            "/danh-muc/dia-chi-hanh-chinh/quoc-gia",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/quoc-gia/index",

        title:
            "Danh mục quốc gia",

        description:
            "Quản lý danh sách quốc gia.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "quoc-gia",

        breadcrumbs: [
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
                    "Địa chỉ hành chính"
            },
            {
                label:
                    "Quốc gia"
            }
        ]
    },

    {
        path:
            "/danh-muc/dia-chi-hanh-chinh/tinh-thanh",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/tinh-thanh/index",

        title:
            "Danh mục tỉnh thành",

        description:
            "Quản lý tỉnh thành theo quốc gia.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "tinh-thanh",

        breadcrumbs: [
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
                    "Địa chỉ hành chính"
            },
            {
                label:
                    "Tỉnh thành"
            }
        ]
    },

    {
        path:
            "/danh-muc/dia-chi-hanh-chinh/xa-phuong",

        view:
            "pages/danh-muc/dia-chi-hanh-chinh/xa-phuong/index",

        title:
            "Danh mục xã phường",

        description:
            "Quản lý xã phường theo tỉnh thành.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "xa-phuong",

        breadcrumbs: [
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
                    "Địa chỉ hành chính"
            },
            {
                label:
                    "Xã phường"
            }
        ]
    },

    // =====================================================
    // SUẤT ĂN
    // =====================================================

    {
        path:
            "/danh-muc/suat-an/ca-an",

        view:
            "pages/danh-muc/suat-an/ca-an/index",

        title:
            "Danh mục ca ăn",

        description:
            "Quản lý các ca ăn trong hệ thống.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "ca-an",

        breadcrumbs: [
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
                    "Suất ăn"
            },
            {
                label:
                    "Ca ăn"
            }
        ]
    },

    {
        path:
            "/danh-muc/suat-an/nhom-mon-an",

        view:
            "pages/danh-muc/suat-an/nhom-mon-an/index",

        title:
            "Danh mục nhóm món ăn",

        description:
            "Quản lý các nhóm phân loại món ăn.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "nhom-mon-an",

        breadcrumbs: [
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
                    "Suất ăn"
            },
            {
                label:
                    "Nhóm món ăn"
            }
        ]
    },

    {
        path:
            "/danh-muc/suat-an/mon-an",

        view:
            "pages/danh-muc/suat-an/mon-an/index",

        title:
            "Danh mục món ăn",

        description:
            "Quản lý danh sách món ăn.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "mon-an",

        breadcrumbs: [
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
                    "Suất ăn"
            },
            {
                label:
                    "Món ăn"
            }
        ]
    },

    {
        path:
            "/danh-muc/suat-an/thuc-pham",

        view:
            "pages/danh-muc/suat-an/thuc-pham/index",

        title:
            "Danh mục thực phẩm",

        description:
            "Quản lý thực phẩm, đơn vị và quy cách.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "thuc-pham",

        breadcrumbs: [
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
                    "Suất ăn"
            },
            {
                label:
                    "Thực phẩm"
            }
        ]
    },

    {
        path:
            "/danh-muc/suat-an/don-vi-tinh",

        view:
            "pages/danh-muc/suat-an/don-vi-tinh/index",

        title:
            "Danh mục đơn vị tính",

        description:
            "Quản lý đơn vị tính và loại đơn vị.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "don-vi-tinh",

        breadcrumbs: [
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
                    "Suất ăn"
            },
            {
                label:
                    "Đơn vị tính"
            }
        ]
    },

    // =====================================================
    // NHÂN SỰ VÀ PHÂN QUYỀN
    // =====================================================

    {
        path:
            "/danh-muc/nhan-su/nhan-vien",

        view:
            "pages/danh-muc/nhan-su/nhan-vien/index",

        title:
            "Danh mục nhân viên",

        description:
            "Quản lý hồ sơ và thông tin nhân viên.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "nhan-vien",

        breadcrumbs: [
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
                    "Nhân sự"
            },
            {
                label:
                    "Nhân viên"
            }
        ]
    },

    {
        path:
            "/danh-muc/nhan-su/tai-khoan",

        view:
            "pages/danh-muc/nhan-su/tai-khoan/index",

        title:
            "Danh mục tài khoản",

        description:
            "Quản lý tài khoản đăng nhập và vai trò.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "tai-khoan",

        breadcrumbs: [
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
                    "Nhân sự"
            },
            {
                label:
                    "Tài khoản"
            }
        ]
    },

    {
        path:
            "/danh-muc/nhan-su/vai-tro",

        view:
            "pages/danh-muc/nhan-su/vai-tro/index",

        title:
            "Danh mục vai trò",

        description:
            "Quản lý vai trò và danh sách quyền.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "vai-tro",

        breadcrumbs: [
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
                    "Nhân sự"
            },
            {
                label:
                    "Vai trò"
            }
        ]
    },

    {
        path:
            "/danh-muc/nhan-su/quyen",

        view:
            "pages/danh-muc/nhan-su/quyen/index",

        title:
            "Danh mục quyền",

        description:
            "Quản lý quyền truy cập chức năng.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "quyen",

        breadcrumbs: [
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
                    "Nhân sự"
            },
            {
                label:
                    "Quyền"
            }
        ]
    },

    {
        path:
            "/danh-muc/nhan-su/nhom-tinh-nang",

        view:
            "pages/danh-muc/nhan-su/nhom-tinh-nang/index",

        title:
            "Danh mục nhóm tính năng",

        description:
            "Phân nhóm các quyền và chức năng hệ thống.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "nhom-tinh-nang",

        breadcrumbs: [
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
                    "Nhân sự"
            },
            {
                label:
                    "Nhóm tính năng"
            }
        ]
    },

    // =====================================================
    // CHÍNH SÁCH
    // =====================================================

    {
        path:
            "/danh-muc/chinh-sach/voucher",

        view:
            "pages/danh-muc/chinh-sach/voucher/index",

        title:
            "Danh mục voucher",

        description:
            "Quản lý voucher và giá trị miễn giảm.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "voucher",

        breadcrumbs: [
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
                    "Chính sách"
            },
            {
                label:
                    "Voucher"
            }
        ]
    },

    {
        path:
            "/danh-muc/chinh-sach/chinh-sach",

        view:
            "pages/danh-muc/chinh-sach/chinh-sach/index",

        title:
            "Danh mục chính sách",

        description:
            "Quản lý các chính sách trong hệ thống.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "chinh-sach",

        breadcrumbs: [
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
                    "Chính sách"
            },
            {
                label:
                    "Chính sách"
            }
        ]
    },

    // =====================================================
    // HỆ THỐNG
    // =====================================================

    {
        path:
            "/danh-muc/he-thong/thiet-lap",

        view:
            "pages/danh-muc/he-thong/thiet-lap/index",

        title:
            "Thiết lập hệ thống",

        description:
            "Quản lý các tham số cấu hình của MCS KitchenFlow.",

        activeMenu:
            "danh-muc",

        activeSubmenu:
            "thiet-lap",

        breadcrumbs: [
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
                    "Hệ thống"
            },
            {
                label:
                    "Thiết lập"
            }
        ]
    }

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
                    .renderPage(page)

        })
    );


module.exports = webRoutes;