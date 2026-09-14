'use strict';

const repository = require('./va04.repository');

const {
    enums,
    enumItem,
    congTong,
    xuatBaoCao
} = require('../ve-an-report.helper');

class Va04Service {
    getTongHop(rows) {
        const phongBanIds = new Set(
            rows
                .filter(row => row.phongBanId != null)
                .map(row => String(row.phongBanId))
        );

        return {
            tongSoNhom: rows.length,

            soPhongBanDaXacDinh: phongBanIds.size,

            ...congTong(rows, [
                'soVeDaPhat',
                'soVeChuaSuDung',
                'soSuatDaSuDung',
                'soVeDaHuy',
                'soVeHetHan'
            ]),

            soSuatChuaXacDinhPhongBan: rows
                .filter(row => row.phongBanId == null)
                .reduce(
                    (sum, row) => sum + row.soSuatDaSuDung,
                    0
                )
        };
    }

    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        return xuatBaoCao({
            maBaoCao: 'va_04',

            tenBaoCao:
                'Báo cáo suất ăn theo phòng ban',

            taiKhoanId,

            filters: {
                ...filters,

                ghiChu:
                    'Ngày lọc là ngày phục vụ theo thực đơn. '
                    + 'Suất đã sử dụng là vé trạng thái Đã sử dụng. '
                    + 'Phòng ban lấy theo hồ sơ nhân viên hiện tại.'
            },

            tongHop: this.getTongHop(rows),

            rows: rows.map(row => ({
                ...row,

                loaiVeThongTin: enumItem(
                    enums.doiTuongLayVe,
                    row.loaiVe
                ),

                tenPhongBanHienThi:
                    row.tenPhongBan
                    || (
                        row.phongBanId == null
                            ? 'Chưa xác định phòng ban'
                            : `Phòng ban #${row.phongBanId}`
                    )
            }))
        });
    }
}

module.exports = new Va04Service();