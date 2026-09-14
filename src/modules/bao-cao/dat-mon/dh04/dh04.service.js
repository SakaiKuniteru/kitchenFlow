'use strict';

const repository = require('./dh04.repository');

const {
    S,
    CT,
    mapDon,
    xuatBaoCao
} = require('../dat-mon-report.helper');

class Dh04Service {
    async taoBaoCao(filters, taiKhoanId) {
        const rows = (
            await repository.getDuLieu(filters)
        ).map(row => ({
            ...mapDon(row),

            // Không đưa món đã hủy vào danh sách cần chuẩn bị.
            dsMon: (row.dsMon || []).filter(
                item => Number(item.trangThai) !== CT.DA_HUY
            )
        }));

        const count = status => rows.filter(
            row => Number(row.trangThaiDon) === status
        ).length;

        return xuatBaoCao({
            maBaoCao: 'dh_04',

            tenBaoCao:
                'Báo cáo đơn hàng cần chuẩn bị và giao',

            filters,
            taiKhoanId,
            rows,

            tongHop: {
                tongSoDon: rows.length,

                choXacNhan: count(S.CHO_XAC_NHAN),
                dangChuanBi: count(S.DANG_CHUAN_BI),
                sanSangGiao: count(S.SAN_SANG_GIAO),
                dangGiao: count(S.DANG_GIAO),

                soDonQuaHanNhan: rows.filter(
                    row => row.daQuaHanNhan === true
                ).length,

                soDonChuaCoNguoiXuLy: rows.filter(
                    row => row.nguoiXuLyId == null
                ).length
            }
        });
    }
}

module.exports = new Dh04Service();