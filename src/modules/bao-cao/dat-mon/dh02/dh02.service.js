'use strict';

const repository = require('./dh02.repository');

const {
    mapDon,
    congTong,
    xuatBaoCao
} = require('../dat-mon-report.helper');

class Dh02Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = (
            await repository.getDuLieu(filters)
        ).map(mapDon);

        return xuatBaoCao({
            maBaoCao: 'dh_02',
            tenBaoCao: 'Báo cáo chi tiết đơn hàng',
            filters,
            taiKhoanId,
            rows,

            tongHop: {
                tongSoDon: rows.length,

                soDonDatHo: rows.filter(
                    row => row.datHo === true
                ).length,

                ...congTong(rows, [
                    'tamTinh',
                    'tongMienGiam',
                    'phiDichVu',
                    'tongThanhToan'
                ])
            }
        });
    }
}

module.exports = new Dh02Service();