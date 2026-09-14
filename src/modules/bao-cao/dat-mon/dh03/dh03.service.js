'use strict';

const repository = require('./dh03.repository');

const {
    xuatBaoCao
} = require('../dat-mon-report.helper');

class Dh03Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        return xuatBaoCao({
            maBaoCao: 'dh_03',

            tenBaoCao:
                'Báo cáo số lượng món và dịch vụ đã đặt',

            filters: {
                ...filters,

                ghiChu:
                    'Nhóm sản phẩm lọc theo danh mục hiện tại. '
                    + 'Tên và đơn vị hiển thị theo snapshot đơn hàng. '
                    + 'Tiền theo dòng chưa phân bổ voucher toàn đơn '
                    + 'và phí dịch vụ.'
            },

            taiKhoanId,
            rows,

            tongHop: {
                tongSoNhom: rows.length,

                tongSoDongChiTiet: rows.reduce(
                    (sum, row) => sum + row.soDongChiTiet,
                    0
                ),

                tongTienTheoDong: rows.reduce(
                    (sum, row) => sum + row.tienTheoDong,
                    0
                )
            }
        });
    }
}

module.exports = new Dh03Service();