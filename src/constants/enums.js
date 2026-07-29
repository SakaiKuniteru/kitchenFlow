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

// module.exports = {

//     gioiTinh: GIOI_TINH,

//     trangThai: TRANG_THAI,

//     active: ACTIVE,

//     loaiMienGiam: LOAI_MIEN_GIAM,

//     loaiChinhSach: LOAI_CHINH_SACH,

//     trangThaiPhieuThu: TRANG_THAI_PHIEU_THU,

//     trangThaiPhieuNhapXuat: TRANG_THAI_PHIEU_NHAP_XUAT,

//     trangThaiBinhChon: TRANG_THAI_BINH_CHON,

//     loaiBinhChon: LOAI_BINH_CHON,

// };


module.exports = {

    "gioiTinh": GIOI_TINH,

    "trangThai": TRANG_THAI,

    "active": ACTIVE,

    "loaiMienGiam": LOAI_MIEN_GIAM,

    "loaiChinhSach": LOAI_CHINH_SACH,

    "loaiDonVi": LOAI_DON_VI,

    "trangThaiPhieuThu": TRANG_THAI_PHIEU_THU,

    "trangThaiPhieuNhapXuat": TRANG_THAI_PHIEU_NHAP_XUAT,

    "trangThaiBinhChon": TRANG_THAI_BINH_CHON,

    "loaiBinhChon": LOAI_BINH_CHON

};