'use strict';

window.MCS = window.MCS || {};

window.MCS.navigationItems = [
    { label: 'Đặt món', group: 'Đặt hàng', url: '/dat-hang/dat-mon' },
    { label: 'Đơn hàng của tôi', group: 'Đặt hàng', url: '/dat-hang/danh-sach-don-hang-cua-toi' },
    { label: 'Nhà ăn nhận đơn', group: 'Đặt hàng', url: '/dat-hang/nhan-don-hang', permission: 'Q002031' },
    {
        label: 'Tổng quan',
        group: 'Trang chủ',
        url: '/',
        permission: 'Q000001'
    },

    {
        label: 'Danh sách thực đơn',
        group: 'Thực đơn',
        url: '/thuc-don/danh-sach-thuc-don',
        permission: 'Q000025'
    },

    {
        label: 'Danh mục Cơ sở',
        group: 'Tổ chức',
        url: '/to-chuc/co-so',
        permission: 'Q000002'
    },

    {
        label: 'Danh mục Nhà ăn',
        group: 'Tổ chức',
        url: '/to-chuc/nha-an',
        permission: 'Q000017'
    },

    {
        label: 'Danh mục Phòng ban',
        group: 'Tổ chức',
        url: '/to-chuc/phong-ban',
        permission: 'Q000003'
    },

    {
        label: 'Danh mục Chức vụ',
        group: 'Tổ chức',
        url: '/to-chuc/chuc-vu',
        permission: 'Q000004'
    },

    {
        label: 'Danh mục Nhân viên',
        group: 'Tổ chức',
        url: '/to-chuc/nhan-vien',
        permission: 'Q000023'
    },

    {
        label: 'Danh mục Kho',
        group: 'Tổ chức',
        url: '/to-chuc/kho',
        permission: 'Q000022'
    },

    {
        label: 'Quản lý bình chọn',
        group: 'Bình chọn',
        url: '/binh-chon/quan-ly-binh-chon',
        permission: ['Q000027']
    },

    {
        label: 'Danh sách bình chọn',
        group: 'Bình chọn',
        url: '/binh-chon/danh-sach-binh-chon',
        permission: ['Q001023', 'Q001025']
    },

    {
        label: 'Lịch sử bình chọn',
        group: 'Bình chọn',
        url: '/binh-chon/lich-su-binh-chon',
        permission: ['Q001027', 'Q001026']
    },

    {
        label: 'Danh mục Vai trò',
        group: 'Phân quyền',
        url: '/phan-quyen/vai-tro',
        permission: 'Q000011'
    },

    {
        label: 'Danh mục Quyền',
        group: 'Phân quyền',
        url: '/phan-quyen/quyen',
        permission: 'Q000010'
    },

    {
        label: 'Quản lý Tài khoản',
        group: 'Phân quyền',
        url: '/phan-quyen/tai-khoan',
        permission: 'Q000012'
    },

    {
        label: 'Danh mục Ca ăn',
        group: 'Suất ăn',
        url: '/suat-an/ca-an',
        permission: 'Q000018'
    },

    {
        label: 'Danh mục Món ăn',
        group: 'Suất ăn',
        url: '/suat-an/mon-an',
        permission: 'Q000020'
    },

    {
        label: 'Danh mục Thực phẩm',
        group: 'Suất ăn',
        url: '/suat-an/thuc-pham',
        permission: 'Q000021'
    },

    {
        label: 'Danh mục Đơn vị tính',
        group: 'Suất ăn',
        url: '/suat-an/don-vi-tinh',
        permission: 'Q000016'
    },

    {
        label: 'Danh mục Giá vé ăn',
        group: 'Suất ăn',
        url: '/suat-an/gia-ve-an',
        permission: 'Q000029'
    },

    {
        label: 'Danh sách lấy vé',
        group: 'Vé ăn',
        url: '/ve-an/danh-sach-lay-ve',
        permission: 'Q000030'
    },

    {
        label: 'Lấy vé',
        group: 'Vé ăn',
        url: '/ve-an/lay-ve-an',
        permission: 'Q000031'
    },

    {
        label: 'Xác nhận sử dụng vé',
        group: 'Vé ăn',
        url: '/ve-an/xac-nhan-su-dung-ve',
        permission: 'Q001047'
    },

    {
        label: 'Danh mục Chính sách',
        group: 'Chính sách',
        url: '/chuong-trinh/chinh-sach',
        permission: 'Q000015'
    },

    {
        label: 'Danh mục Voucher',
        group: 'Chính sách',
        url: '/chuong-trinh/voucher',
        permission: 'Q000014'
    },

    {
        label: 'Danh mục Tổng hợp địa chỉ',
        group: 'Địa chỉ hành chính',
        url: '/dia-chi/dia-chi-hanh-chinh',
        permission: 'Q000005'
    },

    {
        label: 'Danh mục Quốc gia',
        group: 'Địa chỉ hành chính',
        url: '/dia-chi/quoc-gia',
        permission: 'Q000006'
    },

    {
        label: 'Danh mục Tỉnh thành',
        group: 'Địa chỉ hành chính',
        url: '/dia-chi/tinh-thanh',
        permission: 'Q000007'
    },

    {
        label: 'Danh mục Xã phường',
        group: 'Địa chỉ hành chính',
        url: '/dia-chi/xa-phuong',
        permission: 'Q000008'
    },

    {
        label: 'Danh mục Nhóm tính năng',
        group: 'Hệ thống',
        url: '/he-thong/nhom-tinh-nang',
        permission: 'Q000009'
    },

    {
        label: 'Danh mục Nhóm món ăn',
        group: 'Hệ thống',
        url: '/he-thong/nhom-mon-an',
        permission: 'Q000019'
    },

    {
        label: 'Danh mục Báo cáo',
        group: 'Hệ thống',
        url: '/he-thong/bao-cao',
        permission: 'Q000024'
    },

    {
        label: 'Thiết lập chung',
        group: 'Hệ thống',
        url: '/he-thong/thiet-lap',
        permission: 'Q000013'
    },

    {
        label: 'Quản lý thông báo',
        group: 'Hệ thống',
        url: '/he-thong/thong-bao',
        permission: 'Q000026'
    },
    {
        label: 'Danh mục Địa điểm nhận hàng',
        group: 'Đặt hàng',
        url: '/dat-hang/dia-diem-nhan-hang',
        permission: 'Q000035'
    },
    {
        label: 'Danh mục Khung giờ nhận hàng',
        group: 'Đặt hàng',
        url: '/dat-hang/khung-gio-nhan-hang',
        permission: 'Q000036'
    },
    {
        label: 'Danh mục Nhóm sản phẩm',
        group: 'Đặt hàng',
        url: '/dat-hang/nhom-san-pham',
        permission: 'Q000032'
    },
    {
        label: 'Danh mục Sản phẩm',
        group: 'Đặt hàng',
        url: '/dat-hang/san-pham',
        permission: 'Q000033'
    },
    {
        label: 'Danh mục Voucher đơn hàng',
        group: 'Đặt hàng',
        url: '/dat-hang/voucher-don-hang',
        permission: 'Q000034'
    },
    {
        label: 'TC01. Báo cáo chi tiết thu chi',
        group: 'Báo cáo',
        url: '/bao-cao/tc01',
        permission: 'Q003001'
    },

    {
        label: 'TC02. Báo cáo đối soát thanh toán',
        group: 'Báo cáo',
        url: '/bao-cao/tc02',
        permission: 'Q003002'
    },

    {
        label: 'TC03. Báo cáo các khoản chưa thanh toán',
        group: 'Báo cáo',
        url: '/bao-cao/tc03',
        permission: 'Q003003'
    },

    {
        label: 'TC04. Báo cáo miễn giảm và ưu đãi',
        group: 'Báo cáo',
        url: '/bao-cao/tc04',
        permission: 'Q003004'
    },

    {
        label: 'TC05. Báo cáo tổng hợp tiền thu theo người thu',
        group: 'Báo cáo',
        url: '/bao-cao/tc05',
        permission: 'Q003005'
    },

    {
        label: 'TD01. Báo cáo thực đơn theo ngày, tuần, tháng',
        group: 'Báo cáo',
        url: '/bao-cao/td01',
        permission: 'Q003006'
    },

    {
        label: 'TD02. Báo cáo chi tiết món ăn trong thực đơn',
        group: 'Báo cáo',
        url: '/bao-cao/td02',
        permission: 'Q003007'
    },

    {
        label: 'TD03. Báo cáo tần suất và món ăn trùng lặp',
        group: 'Báo cáo',
        url: '/bao-cao/td03',
        permission: 'Q003008'
    },

    {
        label: 'TD04. Báo cáo nhu cầu nguyên liệu theo thực đơn',
        group: 'Báo cáo',
        url: '/bao-cao/td04',
        permission: 'Q003009'
    },

    {
        label: 'TD05. Báo cáo kết quả bình chọn suất ăn',
        group: 'Báo cáo',
        url: '/bao-cao/td05',
        permission: 'Q003010'
    },

    {
        label: 'TD06. Báo cáo tình trạng lập và duyệt thực đơn',
        group: 'Báo cáo',
        url: '/bao-cao/td06',
        permission: 'Q0030XX'
    },

    {
        label: 'VA01. Báo cáo tổng hợp vé ăn',
        group: 'Báo cáo',
        url: '/bao-cao/va01',
        permission: 'Q003011'
    },

    {
        label: 'VA02. Báo cáo chi tiết vé ăn',
        group: 'Báo cáo',
        url: '/bao-cao/va02',
        permission: 'Q003012'
    },

    {
        label: 'VA03. Báo cáo đăng ký và sử dụng vé ăn',
        group: 'Báo cáo',
        url: '/bao-cao/va03',
        permission: 'Q003013'
    },

    {
        label: 'VA04. Báo cáo suất ăn theo phòng ban',
        group: 'Báo cáo',
        url: '/bao-cao/va04',
        permission: 'Q003014'
    },

    {
        label: 'VA05. Báo cáo vé ăn hủy',
        group: 'Báo cáo',
        url: '/bao-cao/va05',
        permission: 'Q003015'
    },

    {
        label: 'DH01. Báo cáo tổng hợp đơn hàng',
        group: 'Báo cáo',
        url: '/bao-cao/dh01',
        permission: 'Q003016'
    },

    {
        label: 'DH02. Báo cáo chi tiết đơn hàng',
        group: 'Báo cáo',
        url: '/bao-cao/dh02',
        permission: 'Q003017'
    },

    {
        label: 'DH03. Báo cáo số lượng món và dịch vụ đã đặt',
        group: 'Báo cáo',
        url: '/bao-cao/dh03',
        permission: 'Q003018'
    },

    {
        label: 'DH04. Báo cáo đơn hàng cần chuẩn bị và giao',
        group: 'Báo cáo',
        url: '/bao-cao/dh04',
        permission: 'Q003019'
    },

    {
        label: 'DH05. Báo cáo tiến độ xử lý và giao hàng',
        group: 'Báo cáo',
        url: '/bao-cao/dh05',
        permission: 'Q003020'
    },

    {
        label: 'DH06. Báo cáo đơn hàng hủy và từ chối',
        group: 'Báo cáo',
        url: '/bao-cao/dh06',
        permission: 'Q0030XX'
    },

    {
        label: 'DH07. Báo cáo đặt hàng theo nhân viên và phòng ban',
        group: 'Báo cáo',
        url: '/bao-cao/dh07',
        permission: 'Q0030XX'
    }
];

window.MCS.navigation = {
    normalizePermission(value) {
        return String(value || '')
            .trim()
            .toUpperCase();
    },

    normalizePath(value) {
        if (!value) {
            return '/';
        }

        let path = String(value).split('?')[0].split('#')[0];

        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        return path || '/';
    },

    getPermissionSet(currentUser = null) {
        const user = currentUser || window.MCS.storage?.getCurrentUser?.() || null;

        const values = [];

        if (Array.isArray(user?.dsQuyen)) {
            user.dsQuyen.forEach((item) => {
                values.push(item?.maQuyen);
            });
        }

        if (Array.isArray(user?.permissions)) {
            user.permissions.forEach((item) => {
                values.push(typeof item === 'string' ? item : item?.maQuyen);
            });
        }

        return new Set(values.map((value) => this.normalizePermission(value)).filter(Boolean));
    },

    hasPermission(permission, currentUser = null) {
        if (Array.isArray(permission)) {
            if (permission.length === 0) {
                return true;
            }

            const permissionSet = this.getPermissionSet(currentUser);

            return permission.some((item) => {
                const code = this.normalizePermission(item);

                return code && permissionSet.has(code);
            });
        }

        const code = this.normalizePermission(permission);

        if (!code) {
            return true;
        }

        return this.getPermissionSet(currentUser).has(code);
    },

    canAccess(item, currentUser = null) {
        if (!item) {
            return false;
        }

        return this.hasPermission(item.permission, currentUser);
    },

    getAllowedItems(currentUser = null) {
        return (window.MCS.navigationItems || []).filter((item) => this.canAccess(item, currentUser));
    },

    findByUrl(url) {
        const path = this.normalizePath(url);

        return (window.MCS.navigationItems || []).find((item) => this.normalizePath(item.url) === path) || null;
    }
};
