'use strict';

const { randomUUID } = require('crypto');

const repository = require('./tc04.repository');

const inBaoCaoService = require(
    '../../../../services/in-bao-cao/in-bao-cao.service'
);

const {
    nhomBaoCao: dsNhomBaoCao
} = require('../../../../constants/enums');

const MA_BAO_CAO = 'tc_04';
const TEN_BAO_CAO = 'Báo cáo miễn giảm và ưu đãi';

const DS_NGUON = [
    { value: 'VA', name: 'Vé ăn' },
    { value: 'DH', name: 'Đơn hàng' }
];

class Tc04Service {
    getTongHop(rows) {
        const chungTuKeys = new Set();

        let tongMienGiamVeAn = 0;
        let tongMienGiamDonHang = 0;

        for (const row of rows) {
            chungTuKeys.add(row.chungTuKey);

            const amount = Number(row.soTienGiam ?? 0);

            if (row.nguon === 'VA') {
                tongMienGiamVeAn += amount;
            }

            if (row.nguon === 'DH') {
                tongMienGiamDonHang += amount;
            }
        }

        return {
            tongSoDongUuDai: rows.length,

            // Dùng nguồn + ID để không trùng vé ăn với đơn hàng.
            tongSoChungTu: chungTuKeys.size,

            tongMienGiamVeAn,
            tongMienGiamDonHang,

            tongMienGiam:
                tongMienGiamVeAn + tongMienGiamDonHang
        };
    }

    buildBoLoc(filters) {
        return {
            ...filters,

            nguonThongTin: DS_NGUON.filter(
                item => filters.nguon.includes(item.value)
            ),

            ghiChuThoiGian:
                'Lọc theo thời gian ghi nhận dòng ưu đãi; '
                + 'dữ liệu và trạng thái chứng từ là hiện tại.'
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

            boLoc: this.buildBoLoc(filters),

            tongSoBanGhi: rows.length,

            tongHop: this.getTongHop(rows),

            ds: rows.map((row, index) => ({
                stt: index + 1,
                ...row,

                tenNguon:
                    row.nguon === 'VA'
                        ? 'Vé ăn'
                        : 'Đơn hàng',

                tenNhaAnHienThi:
                    row.tenNhaAn || 'Chưa xác định nhà ăn'
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

module.exports = new Tc04Service();