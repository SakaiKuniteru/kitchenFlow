"use strict";

const ApiError = require("../../utils/api-error");
const cauHinhRepository = require("./cau-hinh.repository");

const MA_THIET_LAP = {
    TEN_HE_THONG: "TEN_HE_THONG",
    LOGO_CO_SO_MAC_DINH: "LOGO_CO_SO_MAC_DINH",
    SO_LAN_DANG_NHAP_SAI_TOI_DA: "SO_LAN_DANG_NHAP_SAI_TOI_DA",
    THOI_GIAN_KHOA_TAI_KHOAN: "THOI_GIAN_KHOA_TAI_KHOAN",
    THOI_GIAN_ACCESS_TOKEN: "THOI_GIAN_ACCESS_TOKEN",
    THOI_GIAN_REFRESH_TOKEN: "THOI_GIAN_REFRESH_TOKEN",
    THOI_GIAN_TIMEOUT: "THOI_GIAN_TIMEOUT",
    SIDEBAR_MAC_DINH_DONG: "SIDEBAR_MAC_DINH_DONG",
    NGAY_BAT_DAU_TUAN_THUC_DON: "NGAY_BAT_DAU_TUAN_THUC_DON",
    THUC_DON_BAT_BUOC_DU_SO_NGAY: "THUC_DON_BAT_BUOC_DU_SO_NGAY",
    SO_TUAN_HIEN_THI_THUC_DON: "SO_TUAN_HIEN_THI_THUC_DON",
    SO_NAM_HIEN_THI_THUC_DON_THANG: "SO_NAM_HIEN_THI_THUC_DON_THANG",
    QUY_TAC_CHON_DON_VI_QUY_DOI: "QUY_TAC_CHON_DON_VI_QUY_DOI"
};

class CauHinhService {
    async getGiaTriPublic(ma) {
        if (!ma) {
            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );
        }

        const maThietLap = String(ma)
            .trim()
            .toUpperCase();

        const PUBLIC_SETTINGS = new Set([
            MA_THIET_LAP.TEN_HE_THONG,
            MA_THIET_LAP.LOGO_CO_SO_MAC_DINH
        ]);

        if (!PUBLIC_SETTINGS.has(maThietLap)) {
            throw new ApiError(
                403,
                "Thiết lập này không được phép truy cập công khai."
            );
        }

        return this.getGiaTri(maThietLap);
    }

    async getGiaTri(ma) {
        if (!ma) {
            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );
        }

        const maThietLap = String(ma)
            .trim()
            .toUpperCase();

        const thietLap = await cauHinhRepository.getThietLapByMa(maThietLap);

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            throw new ApiError(
                404,
                "Không tìm thấy thiết lập hoặc thiết lập đang tắt."
            );
        }

        switch (maThietLap) {
            case MA_THIET_LAP.LOGO_CO_SO_MAC_DINH:
                return this.resolveLogoCoSoMacDinh(thietLap);

            case MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSidebarDongMacDinh()
                };

            case MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThucDonTuanBatDauThuBay()
                };

            case MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThucDonBatBuocDuSoNgay()
                };

            case MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoTuanHienThiThucDon()
                };

            case MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoNamHienThiThucDonThang()
                };
            
            case MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI:
                return {
                    ma: maThietLap,
                    giaTri: await this.getQuyTacChonDonViQuyDoi()
                };

            default:
                return this.resolveMacDinh(thietLap);
        }
    }

    async resolveLogoCoSoMacDinh(thietLap) {
        const maCoSo = thietLap.gia_tri?.trim();

        if (!maCoSo) {
            throw new ApiError(
                404,
                "Chưa thiết lập cơ sở mặc định."
            );
        }

        const coSo = await cauHinhRepository.getCoSoByMa(maCoSo);

        if (!coSo) {
            throw new ApiError(
                404,
                "Không tìm thấy cơ sở mặc định."
            );
        }

        return {
            ma: thietLap.ma_thiet_lap,
            giaTri: coSo.logo
        };
    }

    resolveMacDinh(thietLap) {
        return {
            ma: thietLap.ma_thiet_lap,
            giaTri: thietLap.gia_tri
        };
    }

    async getSoLanDangNhapSaiToiDa() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_LAN_DANG_NHAP_SAI_TOI_DA
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soLan = Number(giaTri);

        if (
            !Number.isInteger(soLan) ||
            soLan <= 0
        ) {
            return null;
        }

        return soLan;
    }

    async getThoiGianKhoaTaiKhoan() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_KHOA_TAI_KHOAN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        const match = giaTri.match(
            /^(\d+)\/(phut|gio|ngay|thang|nam)$/
        );

        if (!match) {
            return null;
        }

        const soLuong = Number(match[1]);
        const donVi = match[2];

        if (
            !Number.isInteger(soLuong) ||
            soLuong <= 0
        ) {
            return null;
        }

        return {
            soLuong,
            donVi
        };
    }

    async getSoPhutRefreshToken() {
        const MAC_DINH = 20;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_REFRESH_TOKEN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 0
        ) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getThoiGianTimeout() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_TIMEOUT
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 10
        ) {
            return null;
        }

        return soPhut;
    }

    async getSoPhutAccessToken() {
        const MAC_DINH = 20;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_ACCESS_TOKEN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 0
        ) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getSidebarDongMacDinh() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return false;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        return giaTri === "true";
    }

    async getThucDonTuanBatDauThuBay() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return 0;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        return giaTri === "1"
            ? 1
            : 0;
    }

    async getThucDonBatBuocDuSoNgay() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return false;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        return giaTri === "true";
    }

    async getSoTuanHienThiThucDon() {
        const MAC_DINH = 5;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soTuan = Number(giaTri);

        if (
            !Number.isInteger(soTuan) ||
            soTuan <= 0
        ) {
            return MAC_DINH;
        }

        return soTuan;
    }

    async getSoNamHienThiThucDonThang() {
        const MAC_DINH = 5;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soNam = Number(giaTri);

        if (
            !Number.isInteger(soNam) ||
            soNam <= 0
        ) {
            return MAC_DINH;
        }

        return soNam;
    }

    async getQuyTacChonDonViQuyDoi() {

        const MAC_DINH = 4;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(
                thietLap.gia_tri ??
                ""
            ).trim()
        );

        if (!Number.isInteger(giaTri) || ![1, 2, 3, 4].includes( giaTri)
        ) {
            return MAC_DINH;
        }

        return giaTri;

    }
}

module.exports = new CauHinhService();