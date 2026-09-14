'use strict';

const repository = require('./va02.repository');

const {
    enums,
    enumItem,
    xuatBaoCao
} = require('../ve-an-report.helper');

class Va02Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const countStatus = status => rows.filter(
            row => Number(row.trangThaiVe) === status
        ).length;

        const tongHop = {
            tongSoVe: rows.length,

            tongSoPhieu: new Set(
                rows.map(row => String(row.phieuLayVeId))
            ).size,

            soVeChuaSuDung: countStatus(10),
            soVeDaSuDung: countStatus(20),
            soVeDaHuy: countStatus(30),
            soVeHetHan: countStatus(40)
        };

        return xuatBaoCao({
            maBaoCao: 'va_02',
            tenBaoCao: 'Báo cáo chi tiết vé ăn',
            taiKhoanId,
            tongHop,

            filters: {
                ...filters,

                loaiThoiGianThongTin: {
                    value: filters.loaiThoiGian,

                    name:
                        filters.loaiThoiGian === 'NGAY_TAO'
                            ? 'Ngày tạo vé'
                            : 'Ngày phục vụ theo thực đơn'
                }
            },

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

                trangThaiThanhToanThongTin: enumItem(
                    enums.trangThaiPhieuThu,
                    row.trangThaiThanhToan
                ),

                tenNguoiLayVeHienThi:
                    row.hoTenNguoiLayVe
                    || row.tenNhanVien
                    || 'Chưa có thông tin'
            }))
        });
    }
}

module.exports = new Va02Service();