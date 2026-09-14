'use strict';

const repository = require('./dh01.repository');

const {
    S,
    congTong,
    mapDon,
    xuatBaoCao
} = require('../dat-mon-report.helper');

class Dh01Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const donKhongHuy = rows.filter(
            row => ![S.DA_HUY, S.TU_CHOI].includes(
                Number(row.trangThaiDon)
            )
        );

        return xuatBaoCao({
            maBaoCao: 'dh_01',
            tenBaoCao: 'Báo cáo tổng hợp đơn hàng',
            filters,
            taiKhoanId,

            tongHop: {
                tongSoNhom: rows.length,

                tongSoDon: rows.reduce(
                    (sum, row) => sum + row.soDon,
                    0
                ),

                tongGiaTriDonKhongHuy: donKhongHuy.reduce(
                    (sum, row) => sum + row.tongThanhToan,
                    0
                ),

                ...congTong(rows, [
                    'tamTinh',
                    'tongMienGiam',
                    'phiDichVu',
                    'tongThanhToan'
                ])
            },

            rows: rows.map(mapDon)
        });
    }
}

module.exports = new Dh01Service();