'use strict';

const repository = require('./dh05.repository');

const {
    mapDon,
    xuatBaoCao
} = require('../dat-mon-report.helper');

const TEN_DANH_GIA = {
    DUNG_HAN: 'Hoàn thành đúng hạn',
    TRE_HAN: 'Hoàn thành trễ hạn',
    DANG_TRE: 'Chưa hoàn thành, đang trễ hạn',
    CHUA_QUA_HAN: 'Chưa hoàn thành, chưa quá hạn',
    KHONG_DANH_GIA: 'Không đánh giá',
    THIEU_DU_LIEU: 'Thiếu dữ liệu đánh giá'
};

class Dh05Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = (
            await repository.getDuLieu(filters)
        ).map(row => ({
            ...mapDon(row),
            tenDanhGia: TEN_DANH_GIA[row.danhGia] || row.danhGia
        }));

        const count = value => rows.filter(
            row => row.danhGia === value
        ).length;

        const soDonDungHan = count('DUNG_HAN');
        const soDonTreHan = count('TRE_HAN');

        const soDonDaHoanThanhDuDuLieu =
            soDonDungHan + soDonTreHan;

        return xuatBaoCao({
            maBaoCao: 'dh_05',

            tenBaoCao:
                'Báo cáo tiến độ xử lý và giao hàng',

            taiKhoanId,

            filters: {
                ...filters,

                ghiChu:
                    'Đúng hạn: thời điểm ghi nhận hoàn thành '
                    + 'không sau cuối khung nhận dự kiến. '
                    + 'Đây là mốc xử lý trên hệ thống, '
                    + 'không phải xác nhận giao nhận vật lý độc lập.'
            },

            rows,

            tongHop: {
                tongSoDon: rows.length,
                soDonDungHan,
                soDonTreHan,

                soDonDangTre: count('DANG_TRE'),
                soDonChuaQuaHan: count('CHUA_QUA_HAN'),
                soDonKhongDanhGia: count('KHONG_DANH_GIA'),
                soDonThieuDuLieu: count('THIEU_DU_LIEU'),

                tyLeDungHan:
                    soDonDaHoanThanhDuDuLieu === 0
                        ? null
                        : Number((
                            soDonDungHan
                            / soDonDaHoanThanhDuDuLieu
                            * 100
                        ).toFixed(2))
            }
        });
    }
}

module.exports = new Dh05Service();