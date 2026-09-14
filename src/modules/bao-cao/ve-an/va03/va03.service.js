'use strict';

const repository = require('./va03.repository');

const {
    enums,
    enumItem,
    congTong,
    xuatBaoCao
} = require('../ve-an-report.helper');

class Va03Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const tongHop = {
            tongSoPhieu: rows.length,

            soPhieuChuaCoVe: rows.filter(
                row => row.soVeDaPhat === 0
            ).length,

            soPhieuConChoPhatVe: rows.filter(
                row => row.soLuongChuaPhat > 0
            ).length,

            ...congTong(rows, [
                'soLuongTheoPhieu',
                'soVeDaPhat',
                'soVeChuaSuDung',
                'soVeDaSuDung',
                'soVeDaHuy',
                'soVeHetHan',
                'soLuongConDangKy',
                'soLuongChuaPhat'
            ])
        };

        return xuatBaoCao({
            maBaoCao: 'va_03',
            tenBaoCao: 'Báo cáo đăng ký và sử dụng vé ăn',
            taiKhoanId,
            tongHop,

            filters: {
                ...filters,

                ghiChu:
                    'Ngày lọc là ngày phục vụ. '
                    + 'Bộ lọc trạng thái chọn phiếu có vé phù hợp; '
                    + 'số lượng hiển thị gồm toàn bộ vé của phiếu. '
                    + 'Trạng thái được lấy tại thời điểm chạy báo cáo.'
            },

            rows: rows.map(row => ({
                ...row,

                trangThaiPhieuThongTin: enumItem(
                    enums.trangThaiPhieuThu,
                    row.trangThaiPhieu
                ),

                tenNguoiDangKyHienThi:
                    row.hoTenNguoiLayVe
                    || row.tenNhanVien
                    || 'Chưa có thông tin'
            }))
        });
    }
}

module.exports = new Va03Service();