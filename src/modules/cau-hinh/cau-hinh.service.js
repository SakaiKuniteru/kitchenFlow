'use strict';

const cauHinhGiaTriService = require('./cau-hinh-gia-tri.service');

const DONG_BO_HANDLERS = new Map();

class CauHinhService {

    getCauHinhThietLap(ma) {
        return cauHinhGiaTriService.getCauHinhThietLap(ma);
    }

    resolveThoiDiemApDung(maThietLap, context = {}) {
        return cauHinhGiaTriService.resolveThoiDiemApDung(maThietLap, context);
    }

    dangKyDongBo(maThietLap, handler) {
        DONG_BO_HANDLERS.set(
            String(maThietLap).trim().toUpperCase(),
            handler
        );
    }

    async dongBoThietLap(maThietLap, context = {}) {
        const ma = String(maThietLap).trim().toUpperCase();
        const handler = DONG_BO_HANDLERS.get(ma);

        if (!handler) {
            return {
                maThietLap: ma,
                soBanGhi: 0,
                message: 'Thiết lập được áp dụng trực tiếp, không có dữ liệu cần đồng bộ lại.'
            };
        }

        const result = await handler(context);

        return {
            maThietLap: ma,
            ...result
        };
    }

    async getGiaTriRaw(maThietLap, context = {}, client) {
        return cauHinhGiaTriService.getGiaTriRaw(maThietLap, context, client);
    }

    async getGiaTriPublic(ma) {
        return cauHinhGiaTriService.getGiaTriPublic(ma);
    }

    async getGiaTri(ma) {
        return cauHinhGiaTriService.getGiaTri(ma);
    }

    async resolveLogoCoSoMacDinh(thietLap) {
        return cauHinhGiaTriService.resolveLogoCoSoMacDinh(thietLap);
    }

    resolveMacDinh(thietLap) {
        return cauHinhGiaTriService.resolveMacDinh(thietLap);
    }

    async getSoLanDangNhapSaiToiDa() {
        return cauHinhGiaTriService.getSoLanDangNhapSaiToiDa();
    }

    async getThoiGianKhoaTaiKhoan() {
        return cauHinhGiaTriService.getThoiGianKhoaTaiKhoan();
    }

    async getSoPhutRefreshToken() {
        return cauHinhGiaTriService.getSoPhutRefreshToken();
    }

    async getThoiGianTimeout() {
        return cauHinhGiaTriService.getThoiGianTimeout();
    }

    async getSoPhutAccessToken() {
        return cauHinhGiaTriService.getSoPhutAccessToken();
    }

    async getSidebarDongMacDinh() {
        return cauHinhGiaTriService.getSidebarDongMacDinh();
    }

    async getThucDonTuanBatDauThuBay() {
        return cauHinhGiaTriService.getThucDonTuanBatDauThuBay();
    }

    async getThucDonBatBuocDuSoNgay() {
        return cauHinhGiaTriService.getThucDonBatBuocDuSoNgay();
    }

    async getSoTuanHienThiThucDon() {
        return cauHinhGiaTriService.getSoTuanHienThiThucDon();
    }

    async getSoNamHienThiThucDonThang() {
        return cauHinhGiaTriService.getSoNamHienThiThucDonThang();
    }

    async getQuyTacChonDonViQuyDoi() {
        return cauHinhGiaTriService.getQuyTacChonDonViQuyDoi();
    }

    async getQuyTacLamTron() {
        return cauHinhGiaTriService.getQuyTacLamTron();
    }

    async getSoChuSoSauDauPhay() {
        return cauHinhGiaTriService.getSoChuSoSauDauPhay();
    }

    async getBatBuocChonNhomMon() {
        return cauHinhGiaTriService.getBatBuocChonNhomMon();
    }

    async getThuTuDoiTuongLayVe() {
        return cauHinhGiaTriService.getThuTuDoiTuongLayVe();
    }

    async getPhuongThucThanhToanHienThi() {
        return cauHinhGiaTriService.getPhuongThucThanhToanHienThi();
    }

    chuanHoaTienToSinhMa(value) {
        return cauHinhGiaTriService.chuanHoaTienToSinhMa(value);
    }

    parseDinhDangSinhMa(value) {
        return cauHinhGiaTriService.parseDinhDangSinhMa(value);
    }

    taoNguCanhSinhMa(cauHinh, date = new Date()) {
        return cauHinhGiaTriService.taoNguCanhSinhMa(cauHinh, date);
    }

    async getQuyTacSinhMa(maThietLap) {
        return cauHinhGiaTriService.getQuyTacSinhMa(maThietLap);
    }

    async getDinhDangSinhMa(maThietLap) {
        return cauHinhGiaTriService.getDinhDangSinhMa(maThietLap);
    }

    chuanHoaTienToMaVeAn(value) {
        return cauHinhGiaTriService.chuanHoaTienToMaVeAn(value);
    }

    parseDinhDangMaVeAn(value) {
        return cauHinhGiaTriService.parseDinhDangMaVeAn(value);
    }

    async getQuyTacSinhMaVeAn() {
        return cauHinhGiaTriService.getQuyTacSinhMaVeAn();
    }

    async getDinhDangMaVeAn() {
        return cauHinhGiaTriService.getDinhDangMaVeAn();
    }

    async getSoPhutDatHangTruoc(context = {}, client) {
        return cauHinhGiaTriService.getSoPhutDatHangTruoc(context, client);
    }

}

module.exports = new CauHinhService();