'use strict';

const { randomUUID } = require('crypto');

const repository = require('./tc02.repository');
const tc01Service = require('../tc01/tc01.service');

const inBaoCaoService = require(
    '../../../../services/in-bao-cao/in-bao-cao.service'
);

const {
    nhomBaoCao: dsNhomBaoCao,
    phuongThucThanhToan: dsPhuongThucThanhToan
} = require('../../../../constants/enums');

const MA_BAO_CAO = 'tc_02';
const TEN_BAO_CAO = 'Báo cáo đối soát thanh toán vé ăn';

class Tc02Service {
    getTongHop(rows) {
        const fields = [
            'tongSoGiaoDich',
            'soGiaoDichThu',
            'soGiaoDichHoan',
            'soGiaoDichChoXuLy',
            'soGiaoDichDangXuLy',
            'soGiaoDichThanhCong',
            'soGiaoDichThatBai',
            'soGiaoDichDaHuy',
            'tongThu',
            'tongHoan',
            'thucThu'
        ];

        const result = Object.fromEntries(
            fields.map(field => [field, 0])
        );

        for (const row of rows) {
            for (const field of fields) {
                result[field] += Number(row[field] ?? 0);
            }
        }

        return {
            tongSoNhom: rows.length,
            ...result
        };
    }

    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const data = inBaoCaoService.normalizeReportData({
            maBaoCao: MA_BAO_CAO,
            tenBaoCao: TEN_BAO_CAO,

            nhomBaoCao:
                dsNhomBaoCao.find(
                    item => Number(item.value) === 10
                ) || null,

            boLoc: tc01Service.buildBoLoc(filters),

            tongSoBanGhi: rows.length,

            tongHop: this.getTongHop(rows),

            danhSach: rows.map((row, index) => ({
                stt: index + 1,
                ...row,

                phuongThucThanhToanThongTin:
                    dsPhuongThucThanhToan.find(
                        item =>
                            Number(item.value) ===
                            Number(row.phuongThucThanhToan)
                    ) || null
            }))
        });

        return inBaoCaoService.taoBaoCao({
            maBaoCao: MA_BAO_CAO,
            id: randomUUID(),
            soPhieu: null,
            data,
            nguoiInId: taiKhoanId
        });
    }
}

module.exports = new Tc02Service();