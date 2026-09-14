'use strict';

const repository = require('./va01.repository');

const {
    enums,
    enumItem,
    congTong,
    xuatBaoCao
} = require('../ve-an-report.helper');

class Va01Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const tongHop = {
            tongSoNhom: rows.length,

            ...congTong(rows, [
                'tongSoVe',
                'soVeChuaSuDung',
                'soVeDaSuDung',
                'soVeDaHuy',
                'soVeHetHan'
            ])
        };

        return xuatBaoCao({
            maBaoCao: 'va_01',
            tenBaoCao: 'Báo cáo tổng hợp vé ăn',
            filters,
            taiKhoanId,
            tongHop,

            rows: rows.map(row => ({
                ...row,

                loaiVeThongTin: enumItem(
                    enums.doiTuongLayVe,
                    row.loaiVe
                )
            }))
        });
    }
}

module.exports = new Va01Service();