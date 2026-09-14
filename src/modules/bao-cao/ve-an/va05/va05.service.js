'use strict';

const repository = require('./va05.repository');

const {
    enums,
    enumItem,
    xuatBaoCao
} = require('../ve-an-report.helper');

class Va05Service {
    getTongHop(rows) {
        const phieuIds = new Set();
        const nhanVienIds = new Set();
        const nguoiHuyIds = new Set();

        let soVeChuaXacDinhNguoiHuy = 0;
        let soVeChuaCoLyDoHuy = 0;

        for (const row of rows) {
            phieuIds.add(String(row.phieuLayVeId));

            if (row.nhanVienId != null) {
                nhanVienIds.add(String(row.nhanVienId));
            }

            if (row.taiKhoanNguoiHuyId != null) {
                nguoiHuyIds.add(
                    String(row.taiKhoanNguoiHuyId)
                );
            } else {
                soVeChuaXacDinhNguoiHuy++;
            }

            if (!String(row.lyDoHuy ?? '').trim()) {
                soVeChuaCoLyDoHuy++;
            }
        }

        return {
            tongSoVeHuy: rows.length,

            tongSoPhieuCoVeHuy: phieuIds.size,

            // Không tính khách không có ID nhân viên.
            soNhanVienCoVeHuy: nhanVienIds.size,

            soTaiKhoanThucHienHuy: nguoiHuyIds.size,

            soVeChuaXacDinhNguoiHuy,
            soVeChuaCoLyDoHuy
        };
    }

    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        return xuatBaoCao({
            maBaoCao: 'va_05',

            tenBaoCao: 'Báo cáo vé ăn hủy',

            taiKhoanId,

            filters: {
                ...filters,

                ghiChu:
                    'Lọc theo ngày hủy vé. '
                    + 'Chỉ gồm vé hiện đang ở trạng thái Đã hủy; '
                    + 'không phải lịch sử tất cả lần hủy.'
            },

            tongHop: this.getTongHop(rows),

            rows: rows.map(row => ({
                ...row,

                loaiVeThongTin: enumItem(
                    enums.doiTuongLayVe,
                    row.loaiVe
                ),

                trangThaiVeThongTin: enumItem(
                    enums.trangThaiVe,
                    row.trangThaiVe
                ),

                trangThaiPhieuThongTin: enumItem(
                    enums.trangThaiPhieuThu,
                    row.trangThaiPhieu
                ),

                tenNguoiLayVeHienThi:
                    row.hoTenNguoiLayVe
                    || row.tenNhanVien
                    || 'Chưa có thông tin',

                tenNguoiHuyHienThi:
                    row.tenNguoiHuy
                    || row.taiKhoanNguoiHuy
                    || (
                        row.taiKhoanNguoiHuyId == null
                            ? 'Chưa xác định người hủy'
                            : `Tài khoản #${row.taiKhoanNguoiHuyId}`
                    ),

                lyDoHuyHienThi:
                    String(row.lyDoHuy ?? '').trim()
                    || 'Chưa có lý do'
            }))
        });
    }
}

module.exports = new Va05Service();