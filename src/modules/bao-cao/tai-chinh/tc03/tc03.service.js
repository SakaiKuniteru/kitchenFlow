'use strict';

const { randomUUID } = require('crypto');

const repository = require('./tc03.repository');

const inBaoCaoService = require(
    '../../../../services/in-bao-cao/in-bao-cao.service'
);

const {
    loaiThoiGian: dsLoaiThoiGian,
    nhomBaoCao: dsNhomBaoCao,
    doiTuongLayVe: dsDoiTuongLayVe,
    phuongThucThanhToan: dsPhuongThucThanhToan,
    trangThaiPhieuThu: dsTrangThaiPhieuThu,
    trangThaiVe: dsTrangThaiVe
} = require('../../../../constants/enums');

const MA_BAO_CAO = 'tc_03';

const TEN_BAO_CAO = 'Báo cáo các khoản chưa thanh toán';

class Tc03Service {
    getEnumItem(items, value) {
        return items.find(
            item => Number(item.value) === Number(value)
        ) || null;
    }

    getEnumItems(items, values = []) {
        return values
            .map(value => this.getEnumItem(items, value))
            .filter(Boolean);
    }

    getTongHop(rows) {
        const fields = [
            'soLuongPhieu',
            'thanhTien',
            'tongThuThanhCong',
            'tongHoanThanhCong',
            'daThuRong',
            'conPhaiThu'
        ];

        const totals = Object.fromEntries(
            fields.map(field => [field, 0])
        );

        for (const row of rows) {
            for (const field of fields) {
                totals[field] += Number(row[field] ?? 0);
            }
        }

        return {
            tongSoPhieu: rows.length,

            tongSoLuongVe: totals.soLuongPhieu,

            tongThanhTien: totals.thanhTien,

            tongThuThanhCong: totals.tongThuThanhCong,
            tongHoanThanhCong: totals.tongHoanThanhCong,

            tongDaThuRong: totals.daThuRong,

            tongConPhaiThu: totals.conPhaiThu
        };
    }

    buildBoLoc(filters) {
        return {
            ...filters,

            loaiThoiGianThongTin: this.getEnumItem(
                dsLoaiThoiGian,
                filters.loaiThoiGian
            ),

            doiTuongThongTin: this.getEnumItems(
                dsDoiTuongLayVe,
                filters.doiTuong
            ),

            hinhThucThanhToanThongTin: this.getEnumItems(
                dsPhuongThucThanhToan,
                filters.hinhThucThanhToan
            ),

            trangThaiPhieuThuThongTin: this.getEnumItems(
                dsTrangThaiPhieuThu,
                filters.trangThaiPhieuThu
            ),

            trangThaiSuDungThongTin: this.getEnumItems(
                dsTrangThaiVe,
                filters.trangThaiSuDung
            ),

            ghiChuPhamVi:
                'Lọc ngày tạo phiếu; số tiền và trạng thái '
                + 'được xác định tại thời điểm chạy báo cáo.'
        };
    }

    async taoBaoCao(filters, taiKhoanId) {
        const rows = await repository.getDuLieu(filters);

        const data = inBaoCaoService.normalizeReportData({
            maBaoCao: MA_BAO_CAO,
            tenBaoCao: TEN_BAO_CAO,

            nhomBaoCao: this.getEnumItem(
                dsNhomBaoCao,
                10
            ),

            boLoc: this.buildBoLoc(filters),

            tongSoBanGhi: rows.length,

            tongHop: this.getTongHop(rows),

            ds: rows.map((row, index) => ({
                stt: index + 1,
                ...row,

                doiTuongLayVeThongTin: this.getEnumItem(
                    dsDoiTuongLayVe,
                    row.doiTuongLayVe
                ),

                phuongThucThanhToanThongTin: this.getEnumItem(
                    dsPhuongThucThanhToan,
                    row.phuongThucThanhToan
                ),

                trangThaiPhieuThuThongTin: this.getEnumItem(
                    dsTrangThaiPhieuThu,
                    row.trangThaiPhieuThu
                )
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

module.exports = new Tc03Service();