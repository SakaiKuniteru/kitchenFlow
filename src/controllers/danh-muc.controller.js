"use strict";

function textColumn(key, label, options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: options.searchable !== false,
        filterable: options.filterable !== false,
        isBoolean: false,
        className: options.className || (options.center === true ? "catalog-table__cell--center" : ""),
        width: options.width || "",
        ...(options.format ? { format: options.format } : {})
    };
}

function booleanColumn(key = "active", label = "Hiệu lực", options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: false,
        filterable: options.filterable !== false,
        isBoolean: true,
        type: "boolean",
        trueLabel: options.trueLabel || "TRUE",
        falseLabel: options.falseLabel || "FALSE",
        filterOptions: [
            {
                value: "true",
                label: options.trueLabel || "TRUE"
            },
            {
                value: "false",
                label: options.falseLabel || "FALSE"
            }
        ],
        className: options.className || (options.center === false ? "" : "catalog-table__cell--center"),
        width: options.width || "140px"
    };
}

function numberColumn(key, label, options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: options.searchable === true,
        filterable: options.filterable !== false,
        isBoolean: false,
        type: "number",
        className: options.className || "catalog-table__cell--right",
        width: options.width || "130px"
    };
}

function renderDanhMuc(req, res, config) {
    const currentYear = new Date().getFullYear();
    const currentUser = req.user || null;

    return res.render(config.view, {
        layout: "app",
        title: config.title,
        pageTitle: config.title,
        pageDescription: config.description || "",
        currentYear,
        appVersion: process.env.APP_VERSION || "1.0.0",
        currentUser,
        isCatalogPage: true,
        activeMenu: config.activeMenu || "danh-muc",
        activeSubmenu: config.activeSubmenu,
        breadcrumbs: config.breadcrumbs || [
            {
                label: config.page
            }
        ],
        columns: config.columns || [],
        showActions: config.showActions !== false,
        showIndex: config.showIndex !== false,
        showFilterRow: config.showFilterRow !== false,
        selectable: config.selectable === true,
        searchPlaceholder: config.searchPlaceholder || "Tìm theo mã hoặc tên...",
        hideCreateButton: config.hideCreateButton === true,
        showExportButton: config.showExportButton === true,
        formOptions: {
            ...(res.locals.formOptions || {}),
            ...(config.formOptions || {})
        }
    });
}

class DanhMucWebController {
    async coSo(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/co-so/index",
                title: "Danh mục cơ sở",
                description: "Quản lý danh sách cơ sở trong hệ thống.",
                page: "Cơ sở",
                activeSubmenu: "co-so",
                searchPlaceholder: "Tìm theo mã, tên hoặc địa chỉ...",
                columns: [
                    textColumn("maCoSo", "Mã cơ sở", { width: "150px" }),
                    textColumn("tenCoSo", "Tên cơ sở", { width: "220px" }),
                    textColumn("diaChi", "Địa chỉ"),
                    textColumn("tenQuocGia", "Quốc gia", { width: "150px" }),
                    textColumn("tenTinhThanh", "Tỉnh/Thành", { width: "180px" }),
                    textColumn("tenXaPhuong", "Xã/Phường", { width: "180px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async phongBan(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/phong-ban/index",
                title: "Danh mục phòng ban",
                description: "Quản lý phòng ban theo từng cơ sở.",
                page: "Phòng ban",
                activeSubmenu: "phong-ban",
                searchPlaceholder: "Tìm theo mã hoặc tên phòng ban...",
                columns: [
                    textColumn("maPhongBan", "Mã phòng ban", { width: "160px" }),
                    textColumn("tenPhongBan", "Tên phòng ban", { width: "220px" }),
                    textColumn("tenCoSo", "Cơ sở", { width: "220px" }),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chucVu(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/chuc-vu/index",
                title: "Danh mục chức vụ",
                description: "Quản lý các chức vụ của nhân viên.",
                page: "Chức vụ",
                activeSubmenu: "chuc-vu",
                columns: [
                    textColumn("maChucVu", "Mã chức vụ", { width: "160px" }),
                    textColumn("tenChucVu", "Tên chức vụ", { width: "240px" }),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhaAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/nha-an/index",
                title: "Danh mục nhà ăn",
                description: "Quản lý danh sách nhà ăn theo cơ sở.",
                page: "Nhà ăn",
                activeSubmenu: "nha-an",
                columns: [
                    textColumn("maNhaAn", "Mã nhà ăn", { width: "150px" }),
                    textColumn("tenNhaAn", "Tên nhà ăn"),
                    textColumn("tenCoSo", "Cơ sở", { width: "210px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async kho(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/kho/index",
                title: "Danh mục kho",
                description: "Quản lý kho theo từng nhà ăn.",
                page: "Kho",
                activeSubmenu: "kho",
                columns: [
                    textColumn("maKho", "Mã kho", { width: "140px" }),
                    textColumn("tenKho", "Tên kho", { width: "200px" }),
                    textColumn("tenNhaAn", "Nhà ăn", { width: "200px" }),
                    textColumn("loaiKhoText", "Loại kho", { width: "160px" }),
                    textColumn("diaDiem", "Địa điểm", { width: "200px" }),
                    textColumn("dienTich", "Diện tích", { width: "160px" }),
                    textColumn("nhietDoToiThieu", "Nhiệt độ tối thiếu", { width: "140px" }),
                    textColumn("nhietDoToiDa", "Nhiệt độ tối đa", { width: "140px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async diaChiHanhChinh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/tong-hop/index",
                title: "Tổng hợp địa chỉ hành chính",
                description: "Tra cứu tổng hợp quốc gia, tỉnh thành và xã phường.",
                page: "Tổng hợp",
                activeSubmenu: "tong-hop-dia-chi",
                hideCreateButton: true,
                columns: [
                    textColumn("maDiaChi", "Mã địa chỉ", { width: "140px" }),
                    textColumn("tenDiaChi", "Tên địa chỉ"),
                    textColumn("tenQuocGia", "Tên quốc gia", { width: "180px" }),
                    textColumn("tenTiengAnh", "Tên tiếng Anh", { width: "200px" }),
                    textColumn("quocGiaTenVietTat", "Tên viết tắt QG", { width: "160px" }),
                    textColumn("maIso2", "ISO2", { width: "90px" }),
                    textColumn("maIso3", "ISO3", { width: "90px" }),
                    textColumn("tenTinhThanh", "Tên Tỉnh/TP", { width: "190px" }),
                    textColumn("tinhThanhTenVietTat", "Tên viết tắt Tỉnh/TP", { width: "190px" }),
                    textColumn("tenXaPhuong", "Tên Xã/Phường", { width: "190px" }),
                    textColumn("xaPhuongTenVietTat", "Tên viết tắt Xã/Phường", { width: "190px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async quocGia(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/quoc-gia/index",
                title: "Danh mục quốc gia",
                description: "Quản lý danh sách quốc gia.",
                page: "Quốc gia",
                activeSubmenu: "quoc-gia",
                columns: [
                    textColumn("maQuocGia", "Mã quốc gia", { width: "140px" }),
                    textColumn("tenQuocGia", "Tên quốc gia"),
                    textColumn("tenTiengAnh", "Tên tiếng Anh", { width: "220px" }),
                    textColumn("tenVietTat", "Tên viết tắt", { width: "160px" }),
                    textColumn("maIso2", "ISO2", { width: "85px" }),
                    textColumn("maIso3", "ISO3", { width: "85px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async tinhThanh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/tinh-thanh/index",
                title: "Danh mục tỉnh thành",
                description: "Quản lý tỉnh thành theo quốc gia.",
                page: "Tỉnh thành",
                activeSubmenu: "tinh-thanh",
                columns: [
                    textColumn("maTinhThanh", "Mã tỉnh thành", { width: "160px" }),
                    textColumn("tenTinhThanh", "Tên tỉnh thành"),
                    textColumn("tenVietTat", "Tên viết tắt"),
                    textColumn("tenQuocGia", "Quốc gia"),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async xaPhuong(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/xa-phuong/index",
                title: "Danh mục xã phường",
                description: "Quản lý xã phường theo tỉnh thành.",
                page: "Xã phường",
                activeSubmenu: "xa-phuong",
                columns: [
                    textColumn("maXaPhuong", "Mã xã phường", { width: "160px" }),
                    textColumn("tenXaPhuong", "Tên xã phường", { width: "200px" }),
                    textColumn("tenVietTat", "Tên viết tắt", { width: "160px" }),
                    textColumn("tenTinhThanh", "Tỉnh thành", { width: "200px" }),
                    textColumn("tenQuocGia", "Quốc gia", { width: "170px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async caAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/ca-an/index",
                title: "Danh mục ca ăn",
                description: "Quản lý các ca ăn trong hệ thống.",
                page: "Ca ăn",
                activeSubmenu: "ca-an",
                columns: [
                    textColumn("maCaAn", "Mã ca ăn", { width: "140px" }),
                    textColumn("tenCaAn", "Tên ca ăn"),
                    textColumn("gioBatDau", "Giờ bắt đầu", { width: "130px" }),
                    textColumn("gioKetThuc", "Giờ kết thúc", { width: "130px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhomMonAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/nhom-mon-an/index",
                title: "Danh mục nhóm món ăn",
                description: "Quản lý các nhóm phân loại món ăn.",
                page: "Nhóm món ăn",
                activeSubmenu: "nhom-mon-an",
                columns: [
                    textColumn("maNhomMonAn", "Mã nhóm món ăn"),
                    textColumn("tenNhomMonAn", "Tên nhóm món ăn"),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async monAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/mon-an/index",
                title: "Danh mục món ăn",
                description: "Quản lý danh sách món ăn.",
                page: "Món ăn",
                activeSubmenu: "mon-an",
                columns: [
                    textColumn("maMonAn", "Mã món ăn", { width: "140px" }),
                    textColumn("tenMonAn", "Tên món ăn", { width: "220px" }),
                    textColumn("tenNhomMonAn", "Nhóm món ăn", { width: "200px" }),
                    numberColumn("giaTien", "Giá tiền", { width: "140px" }),
                    numberColumn("giaDuKien", "Giá dự kiến", { width: "150px" }),
                    numberColumn("calories", "Calories", { width: "120px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async thucPham(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/thuc-pham/index",
                title: "Danh mục thực phẩm",
                description: "Quản lý thực phẩm, đơn vị và quy cách.",
                page: "Thực phẩm",
                activeSubmenu: "thuc-pham",
                columns: [
                    textColumn("maThucPham", "Mã thực phẩm", { width: "150px" }),
                    textColumn("tenThucPham", "Tên thực phẩm", { width: "220px" }),
                    textColumn("tenDonViSoCap", "Đơn vị sơ cấp", { width: "160px" }),
                    textColumn("tenDonViSuDung", "Đơn vị sử dụng", { width: "160px" }),
                    numberColumn("heSoQuyDoi", "Hệ số quy đổi", { width: "140px" }),
                    textColumn("quyCach", "Quy cách", { width: "180px" }),
                    numberColumn("giaNhap", "Giá nhập", { width: "140px" }),
                    numberColumn("tyLeHaoHutDuKien", "Tỷ lệ hao hụt", { width: "150px" }),
                    textColumn("xuatXu", "Xuất xứ", { width: "180px" }),
                    textColumn("dieuKienBaoQuan", "Điều kiện bảo quản", { width: "220px" }),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    textColumn("ghiChu", "Ghi chú", { width: "220px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async donViTinh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/don-vi-tinh/index",
                title: "Danh mục đơn vị tính",
                description: "Quản lý đơn vị tính và loại đơn vị.",
                page: "Đơn vị tính",
                activeSubmenu: "don-vi-tinh",
                columns: [
                    textColumn("maDonViTinh", "Mã đơn vị tính"),
                    textColumn("tenDonViTinh", "Tên đơn vị tính"),
                    textColumn("loaiDonViText", "Loại đơn vị"),
                    textColumn("kyHieu", "Ký hiệu"),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhanVien(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/nhan-su/nhan-vien/index",
                title: "Danh mục nhân viên",
                description: "Quản lý hồ sơ và thông tin nhân viên.",
                page: "Nhân viên",
                activeSubmenu: "nhan-vien",
                columns: [
                    textColumn("maNhanVien", "Mã nhân viên", { width: "150px" }),
                    textColumn("tenDangNhap", "Tên đăng nhập", { width: "170px" }),
                    textColumn("hoTen", "Họ tên", { width: "220px" }),
                    textColumn("email", "Email", { width: "220px" }),
                    textColumn("soDienThoai", "Số điện thoại", { width: "150px" }),
                    textColumn("ngaySinh", "Ngày sinh", { width: "130px" }),
                    textColumn("gioiTinh", "Giới tính", {
                        width: "120px",
                        format: value => {
                            const labels = {
                                0: "Nữ",
                                1: "Nam",
                                2: "Khác"
                            };

                            return labels[value] ?? "";
                        }
                    }),
                    textColumn("tenChucVu", "Chức vụ", { width: "180px" }),
                    textColumn("tenPhongBan", "Phòng ban", { width: "190px" }),
                    textColumn("tenCoSo", "Cơ sở", { width: "190px" }),
                    textColumn("diaChi", "Địa chỉ"),
                    textColumn("tenQuocGia", "Quốc gia", { width: "160px" }),
                    textColumn("tenTinhThanh", "Tỉnh/Thành", { width: "180px" }),
                    textColumn("tenXaPhuong", "Xã/Phường", { width: "180px" }),
                    textColumn("maThe", "Mã thẻ", { width: "150px" }),
                    textColumn("ghiChu", "Ghi chú", { width: "220px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async taiKhoan(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/nhan-su/tai-khoan/index",
                title: "Danh mục tài khoản",
                description: "Quản lý tài khoản đăng nhập và vai trò.",
                page: "Tài khoản",
                activeSubmenu: "tai-khoan",
                columns: [
                    textColumn("maNhanVien", "Mã nhân viên", { width: "150px" }),
                    textColumn("tenDangNhap", "Tên đăng nhập", { width: "170px" }),
                    textColumn("hoTenNhanVien", "Tên nhân viên", { width: "220px" }),
                    numberColumn("soLanDangNhap", "Số lần đăng nhập", { width: "160px" }),
                    numberColumn("soLanDangNhapSai", "Số lần nhập sai", { width: "150px" }),
                    booleanColumn("biKhoa", "Bị khóa", { width: "120px" }),
                    textColumn("khoaDen", "Khóa đến", { width: "180px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" }),
                    textColumn("__resetPassword", "Thao tác", { width: "90px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async vaiTro(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/vai-tro/index",
                title: "Danh mục vai trò",
                description: "Quản lý vai trò và danh sách quyền.",
                page: "Vai trò",
                activeSubmenu: "vai-tro",
                columns: [
                    textColumn("maVaiTro", "Mã vai trò"),
                    textColumn("tenVaiTro", "Tên vai trò"),
                    textColumn("moTa", "Mô tả"),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async quyen(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/quyen/index",
                title: "Danh mục quyền",
                description: "Quản lý quyền truy cập chức năng.",
                page: "Quyền",
                activeSubmenu: "quyen",
                columns: [
                    textColumn("maQuyen", "Mã quyền", { width: "200px" }),
                    textColumn("tenQuyen", "Tên quyền", { width: "240px" }),
                    textColumn("nhomTinhNang", "Nhóm tính năng", { width: "260px" }),
                    textColumn("moTa", "Mô tả", { width: "300px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhomTinhNang(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/nhom-tinh-nang/index",
                title: "Danh mục nhóm tính năng",
                description: "Phân nhóm các quyền và chức năng hệ thống.",
                page: "Nhóm tính năng",
                activeSubmenu: "nhom-tinh-nang",
                columns: [
                    textColumn("maNhomTinhNang", "Mã nhóm"),
                    textColumn("tenNhomTinhNang", "Tên nhóm tính năng"),
                    textColumn("moTa", "Mô tả"),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async voucher(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/chinh-sach/voucher/index",
                title: "Danh mục voucher",
                description: "Quản lý voucher và giá trị miễn giảm.",
                page: "Voucher",
                activeSubmenu: "voucher",
                columns: [
                    textColumn("maVoucher", "Mã voucher", { width: "150px" }),
                    textColumn("tenVoucher", "Tên voucher"),
                    textColumn("loaiMienGiamText", "Loại", { width: "170px" }),
                    numberColumn("giaTri", "Giá trị", { width: "140px" }),
                    numberColumn("soLuong", "Số lượng", { width: "120px" }),
                    booleanColumn("active", "Trạng thái", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chinhSach(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/chinh-sach/chinh-sach/index",
                title: "Danh mục chính sách",
                description: "Quản lý các chính sách trong hệ thống.",
                page: "Chính sách",
                activeSubmenu: "chinh-sach",
                columns: [
                    textColumn("maChinhSach", "Mã chính sách", { width: "160px" }),
                    textColumn("tenChinhSach", "Tên chính sách", { width: "220px" }),
                    textColumn("loaiChinhSachText", "Loại chính sách", { width: "180px" }),
                    textColumn("tenVoucher", "Tên voucher", { width: "220px" }),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    booleanColumn("active", "Trạng thái", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async thietLap(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/thiet-lap/index",
                title: "Thiết lập hệ thống",
                description: "Quản lý các tham số cấu hình của MCS KitchenFlow.",
                page: "Thiết lập",
                activeSubmenu: "thiet-lap",
                columns: [
                    textColumn("maThietLap", "Mã thiết lập", { width: "230px" }),
                    textColumn("tenThietLap", "Tên thiết lập", { width: "220px" }),
                    textColumn("giaTri", "Giá trị", { width: "160px" }),
                    textColumn("nhomTinhNang", "Nhóm tính năng", { width: "220px" }),
                    textColumn("moTa", "Mô tả", { width: "250px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async baoCao(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/bao-cao/index",
                title: "Danh mục báo cáo",
                description: "Quản lý các báo cáo trong hệ thống.",
                page: "Báo cáo",
                activeSubmenu: "bao-cao",
                columns: [
                    textColumn("maBaoCao", "Mã báo cáo", { width: "200px" }),
                    textColumn("tenBaoCao", "Tên báo cáo", { width: "240px" }),
                    textColumn("loaiXuatFileText", "Loại xuất file", { width: "160px" }),
                    textColumn("moTa", "Mô tả", { width: "280px" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DanhMucWebController();