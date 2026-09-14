'use strict';

const danhMucWebController = require('../../controllers/danh-muc.controller');
const thucDonWebController = require('../../controllers/thuc-don.controller');
const chiTietWebController = require('../../controllers/chi-tiet.controller');
const veAnWebController = require('../../controllers/ve-an.controller');
const datHangWebController = require('../../controllers/dat-hang.controller');
const baoCaoWebController = require('../../controllers/bao-cao.controller');

const danhMucRoutes = [
    {
        method: 'get',
        path: '/to-chuc/co-so',
        handler: danhMucWebController.coSo
    },
    {
        method: 'get',
        path: '/to-chuc/phong-ban',
        handler: danhMucWebController.phongBan
    },
    {
        method: 'get',
        path: '/to-chuc/chuc-vu',
        handler: danhMucWebController.chucVu
    },
    {
        method: 'get',
        path: '/to-chuc/nha-an',
        handler: danhMucWebController.nhaAn
    },
    {
        method: 'get',
        path: '/to-chuc/kho',
        handler: danhMucWebController.kho
    },
    {
        method: 'get',
        path: '/dia-chi/dia-chi-hanh-chinh',
        handler: danhMucWebController.diaChiHanhChinh
    },
    {
        method: 'get',
        path: '/dia-chi/quoc-gia',
        handler: danhMucWebController.quocGia
    },
    {
        method: 'get',
        path: '/dia-chi/tinh-thanh',
        handler: danhMucWebController.tinhThanh
    },
    {
        method: 'get',
        path: '/dia-chi/xa-phuong',
        handler: danhMucWebController.xaPhuong
    },
    {
        method: 'get',
        path: '/suat-an/ca-an',
        handler: danhMucWebController.caAn
    },
    {
        method: 'get',
        path: '/he-thong/nhom-mon-an',
        handler: danhMucWebController.nhomMonAn
    },
    {
        method: 'get',
        path: '/suat-an/mon-an',
        handler: danhMucWebController.monAn
    },
    {
        method: 'get',
        path: '/suat-an/thuc-pham',
        handler: danhMucWebController.thucPham
    },
    {
        method: 'get',
        path: '/suat-an/don-vi-tinh',
        handler: danhMucWebController.donViTinh
    },
    {
        method: 'get',
        path: '/suat-an/gia-ve-an',
        handler: danhMucWebController.giaVeAn
    },
    {
        method: 'get',
        path: '/to-chuc/nhan-vien',
        handler: danhMucWebController.nhanVien
    },
    {
        method: 'get',
        path: '/phan-quyen/tai-khoan',
        handler: danhMucWebController.taiKhoan
    },
    {
        method: 'get',
        path: '/phan-quyen/vai-tro',
        handler: danhMucWebController.vaiTro
    },
    {
        method: 'get',
        path: '/phan-quyen/quyen',
        handler: danhMucWebController.quyen
    },
    {
        method: 'get',
        path: '/he-thong/nhom-tinh-nang',
        handler: danhMucWebController.nhomTinhNang
    },
    {
        method: 'get',
        path: '/chuong-trinh/voucher',
        handler: danhMucWebController.voucher
    },
    {
        method: 'get',
        path: '/chuong-trinh/chinh-sach',
        handler: danhMucWebController.chinhSach
    },
    {
        method: 'get',
        path: '/he-thong/thiet-lap',
        handler: danhMucWebController.thietLap
    },
    {
        method: 'get',
        path: '/he-thong/bao-cao',
        handler: danhMucWebController.baoCao
    },
    {
        method: 'get',
        path: '/he-thong/thong-bao',
        handler: danhMucWebController.thongBao
    },
    {
        method: 'get',
        path: '/binh-chon/quan-ly-binh-chon',
        handler: danhMucWebController.binhChon
    },
    {
        method: 'get',
        path: '/dat-hang/dia-diem-nhan-hang',
        handler: danhMucWebController.diaDiemNhanHang
    },
    {
        method: 'get',
        path: '/dat-hang/khung-gio-nhan-hang',
        handler: danhMucWebController.khungGioNhanHang
    },
    {
        method: 'get',
        path: '/dat-hang/nhom-san-pham',
        handler: danhMucWebController.nhomSanPham
    },
    {
        method: 'get',
        path: '/dat-hang/san-pham',
        handler: danhMucWebController.sanPham
    },
    {
        method: 'get',
        path: '/dat-hang/voucher-don-hang',
        handler: danhMucWebController.voucherDonHang
    }
];

const thucDonRoutes = [
    {
        method: 'get',
        path: '/thuc-don/danh-sach-thuc-don',
        handler: thucDonWebController.danhSach
    },
    {
        method: 'get',
        path: '/thuc-don/them-moi-thuc-don',
        handler: thucDonWebController.themMoi
    },
    {
        method: 'get',
        path: '/thuc-don/thong-tin-chi-tiet-thuc-don/:id',
        handler: thucDonWebController.chiTiet
    },
    {
        method: 'get',
        path: '/thuc-don/cap-nhat-thong-tin-thuc-don/:id',
        handler: thucDonWebController.capNhat
    }
];

const chiTietRoutes = [
    {
        method: 'get',
        path: '/thong-bao',
        handler: chiTietWebController.cuaToi
    },
    {
        method: 'get',
        path: '/thong-tin-chi-tiet-thuc-don/:thucDonId/:thucDonNgayId',
        handler: chiTietWebController.thucDon
    },
    {
        method: 'get',
        path: '/binh-chon/danh-sach-binh-chon',
        handler: chiTietWebController.danhSachBinhChon
    },
    {
        method: 'get',
        path: '/binh-chon/chi-tiet-binh-chon/:thucDonId/:dotBinhChonId',
        handler: chiTietWebController.binhChon
    },
    {
        method: 'get',
        path: '/binh-chon/lich-su-binh-chon',
        handler: chiTietWebController.lichSuBinhChon
    }
];

const veAnRoutes = [
    {
        method: 'get',
        path: '/ve-an/danh-sach-lay-ve',
        handler: veAnWebController.danhSachLayVe
    },
    {
        method: 'get',
        path: '/ve-an/xac-nhan-su-dung-ve',
        handler: veAnWebController.xacNhanSuDungVe
    },
    {
        method: 'get',
        path: '/ve-an/lay-ve-an/:id',
        handler: veAnWebController.layVeAn
    },
    {
        method: 'get',
        path: '/ve-an/lay-ve-an',
        handler: veAnWebController.layVeAn
    }
];

const datHangRoutes = [
    {
        method: 'get',
        path: '/dat-hang/dat-mon',
        handler: datHangWebController.datMon
    },
    {
        method: 'get',
        path: '/dat-hang/thong-tin-nhan-hang/\:taiKhoanId',
        handler: datHangWebController.thongTinNhanHang
    },
    {
        method: 'get',
        path: '/dat-hang/xac-nhan-don-hang/\:taiKhoanId',
        handler: datHangWebController.xacNhanDonHang
    },
    {
        method: 'get',
        path: '/dat-hang/hoan-tat-don-hang/\:taiKhoanId/\:donHangId',
        handler: datHangWebController.hoanTatDonHang
    },
    {
        method: 'get',
        path: '/dat-hang/nhan-don-hang',
        handler: datHangWebController.nhanDonHang
    },
    {
        method: 'get',
        path: '/dat-hang/chi-tiet-xu-ly-don-hang/\:nguoiDatId/\:donHangId',
        handler: datHangWebController.chiTietXuLyDonHang
    },
    {
        method: 'get',
        path: '/dat-hang/danh-sach-don-hang-cua-toi',
        handler: datHangWebController.danhSachDonHangCuaToi
    },
    {
        method: 'get',
        path: '/dat-hang/chi-tiet-don-hang-cua-toi/\:taiKhoanId/\:donHangId',
        handler: datHangWebController.chiTietDonHangCuaToi
    }
];

const baoCaoRoutes = [
    {
        method: 'get',
        path: '/bao-cao',
        handler: baoCaoWebController.index
    },
    {
        method: 'get',
        path: '/bao-cao/tc01',
        handler: baoCaoWebController.tc01
    },
    {
        method: 'get',
        path: '/bao-cao/tc02',
        handler: baoCaoWebController.tc02
    },
    {
        method: 'get',
        path: '/bao-cao/tc03',
        handler: baoCaoWebController.tc03
    },
    {
        method: 'get',
        path: '/bao-cao/tc04',
        handler: baoCaoWebController.tc04
    },
    {
        method: 'get',
        path: '/bao-cao/tc05',
        handler: baoCaoWebController.tc05
    },

    // BÁO CÁO THỤC ĐƠN //
    {
        method: 'get',
        path: '/bao-cao/td01',
        handler: baoCaoWebController.td01
    },
    {
        method: 'get',
        path: '/bao-cao/td02',
        handler: baoCaoWebController.td02
    },
    {
        method: 'get',
        path: '/bao-cao/td03',
        handler: baoCaoWebController.td03
    },
    {
        method: 'get',
        path: '/bao-cao/td04',
        handler: baoCaoWebController.td04
    },
    {
        method: 'get',
        path: '/bao-cao/td05',
        handler: baoCaoWebController.td05
    },
    {
        method: 'get',
        path: '/bao-cao/td06',
        handler: baoCaoWebController.td06
    },

    // BÁO CÁO VÉ ĂN //
    {
        method: 'get',
        path: '/bao-cao/va01',
        handler: baoCaoWebController.va01
    },
    {
        method: 'get',
        path: '/bao-cao/va02',
        handler: baoCaoWebController.va02
    },
    {
        method: 'get',
        path: '/bao-cao/va03',
        handler: baoCaoWebController.va03
    },
    {
        method: 'get',
        path: '/bao-cao/td04',
        handler: baoCaoWebController.va04
    },
    {
        method: 'get',
        path: '/bao-cao/td05',
        handler: baoCaoWebController.va05
    },

    // BÁO CÁO ĐẶT MÓN //
    {
        method: 'get',
        path: '/bao-cao/dh01',
        handler: baoCaoWebController.dh01
    },
    {
        method: 'get',
        path: '/bao-cao/dh02',
        handler: baoCaoWebController.dh02
    },
    {
        method: 'get',
        path: '/bao-cao/dh03',
        handler: baoCaoWebController.dh03
    },
    {
        method: 'get',
        path: '/bao-cao/dh04',
        handler: baoCaoWebController.dh04
    },
    {
        method: 'get',
        path: '/bao-cao/dh05',
        handler: baoCaoWebController.dh05
    },
    {
        method: 'get',
        path: '/bao-cao/dh06',
        handler: baoCaoWebController.dh06
    },
    {
        method: 'get',
        path: '/bao-cao/dh07',
        handler: baoCaoWebController.dh07
    },
];

module.exports = [
    ...danhMucRoutes, 
    ...thucDonRoutes, 
    ...chiTietRoutes, 
    ...veAnRoutes, 
    ...datHangRoutes,
    ...baoCaoRoutes
];
