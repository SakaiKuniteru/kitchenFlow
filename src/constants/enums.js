const GIOI_TINH = [

    {
        value: 0,
        name: "Nam"
    },

    {
        value: 1,
        name: "Nữ"
    },

    {
        value: 2,
        name: "Khác"
    }

];

const TRANG_THAI = [

    {
        value: true,
        name: "Hoạt động"
    },

    {
        value: false,
        name: "Khóa"
    }

];

const ACTIVE = [

    {
        value: true,
        name: "Có"
    },

    {
        value: false,
        name: "Không"
    }

];

const LOAI_MIEN_GIAM = [

    {
        value: 10,
        name: "Phần trăm"
    },

    {
        value: 20,
        name: "Số tiền"
    }

];

const LOAI_CHINH_SACH = [

    {
        value: 10,
        name: "Vai trò"
    },

    {
        value: 20,
        name: "Chức vụ"
    },

    {
        value: 30,
        name: "Tài khoản"
    }

];

const LOAI_DON_VI = [

    {
        value: 10,
        name: "Khối lượng"
    },

    {
        value: 20,
        name: "Thể tích"
    },

    {
        value: 30,
        name: "Đếm"
    }

];

const LOAI_KHO = [

    {
        value: 10,
        name: "Kho khô"
    },

    {
        value: 20,
        name: "Kho mát"
    },

    {
        value: 30,
        name: "Kho đông lạnh"
    },

    {
        value: 40,
        name: "Kho gia vị"
    },

    {
        value: 50,
        name: "Kho thành phẩm"
    },

    {
        value: 60,
        name: "Kho khác"
    }

];

const LOAI_XUAT_FILE = [

    {
        value: 10,
        name: "PDF"
    },

    {
        value: 20,
        name: "Word"
    },

    {
        value: 30,
        name: "Excel"
    }

];

const TRANG_THAI_THUC_DON = [
    {
        value: 10,
        name: "Tạo mới/Chờ duyệt"
    },
    {
        value: 20,
        name: "Chờ duyệt"
    },
    {
        value: 30,
        name: "Đang áp dụng"
    },
    {
        value: 40,
        name: "Chờ duyệt lại"
    },
    {
        value: 50,
        name: "Đã hủy"
    },
    {
        value: 60,
        name: "Đã kết thúc"
    }
];

const LOAI_THUC_DON = [
    {
        value: 10,
        name: "Theo ngày"
    },
    {
        value: 20,
        name: "Theo tuần"
    },
    {
        value: 30,
        name: "Theo tháng"
    },
    {
        value: 40,
        name: "Theo thời gian"
    }
];

const TRANG_THAI_PHIEU_THU = [
    {
        value: -10,
        name: "Chưa thanh toán + Tạo QR"
    },

    {
        value: 0,
        name: "Chưa thanh toán"
    },

    {
        value: 10,
        name: "Tạo QR"
    },

    {
        value: 50,
        name: "Đã thanh toán"
    }
]

const TRANG_THAI_PHIEU_NHAP_XUAT = [
    {
        value: 10,
        name: "Tạo mới"
    },
    {
        value: 20,
        name: "Chờ duyệt"
    },

    {
        value: 30,
        name: "Đã duyệt"
    }

]

const TRANG_THAI_BINH_CHON = [
    {
        value: 10,
        name: "Chưa bình chọn"
    },

    {
        value: 20,
        name: "Đã bình chọn"
    }
]

const LOAI_BINH_CHON = [
    {
        value: 0,
        name: "Không"
    },

    {
        value: 1,
        name: "Có"
    }
]

module.exports = {

    "gioiTinh": GIOI_TINH,

    "trangThai": TRANG_THAI,

    "active": ACTIVE,

    "loaiMienGiam": LOAI_MIEN_GIAM,

    "loaiChinhSach": LOAI_CHINH_SACH,

    "loaiDonVi": LOAI_DON_VI,

    "loaiKho": LOAI_KHO,

    "loaiXuatFile": LOAI_XUAT_FILE,

    "trangThaiThucDon": TRANG_THAI_THUC_DON,

    "loaiThucDon": LOAI_THUC_DON,

    "trangThaiPhieuThu": TRANG_THAI_PHIEU_THU,

    "trangThaiPhieuNhapXuat": TRANG_THAI_PHIEU_NHAP_XUAT,

    "trangThaiBinhChon": TRANG_THAI_BINH_CHON,

    "loaiBinhChon": LOAI_BINH_CHON

};