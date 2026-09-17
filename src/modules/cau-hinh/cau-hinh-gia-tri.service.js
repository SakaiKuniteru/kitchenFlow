'use strict';

const ApiError = require('../../utils/api-error');
const cauHinhRepository = require('./cau-hinh.repository');
const {
    MA_THIET_LAP,
    QUY_TAC_CO_SO,
    MOC_THOI_GIAN,
    GIA_TRI_MAC_DINH
} = require('./cau-hinh.constants');
const {
    THIET_LAP_KHONG_CHO_CHON_CO_SO,
    THIET_LAP_BAT_BUOC_CO_SO
} = require('./config/cau-hinh-co-so.config');
const { MOC_THOI_GIAN_THEO_THIET_LAP } = require('./config/cau-hinh-thoi-gian.config');
const { PUBLIC_SETTINGS } = require('./config/cau-hinh-public.config');
const {
    laThietLapDinhDangMa,
    getDinhDangMaMacDinh
} = require('./config/cau-hinh-ma.config');

class CauHinhGiaTriService {
        coGiaTriMacDinh(maThietLap) {
        return Object.prototype
            .hasOwnProperty
            .call(GIA_TRI_MAC_DINH, maThietLap);
    }

    getGiaTriMacDinh(maThietLap) {
        if (!this.coGiaTriMacDinh(maThietLap)) {
            return undefined;
        }
        return GIA_TRI_MAC_DINH[maThietLap];
    }
    getCauHinhThietLap(ma) {
        const maThietLap = String(ma || '').trim().toUpperCase();
        let quyTacCoSo = QUY_TAC_CO_SO.TUY_CHON;

        if (THIET_LAP_KHONG_CHO_CHON_CO_SO.has(maThietLap)) {
            quyTacCoSo = QUY_TAC_CO_SO.KHONG_CHO_CHON;
        } else if (THIET_LAP_BAT_BUOC_CO_SO.has(maThietLap)) {
            quyTacCoSo = QUY_TAC_CO_SO.BAT_BUOC;
        }

        return {
            maThietLap,
            quyTacCoSo,
            batBuocCoSo: quyTacCoSo === QUY_TAC_CO_SO.BAT_BUOC,
            choPhepCoSo: quyTacCoSo !== QUY_TAC_CO_SO.KHONG_CHO_CHON,
            mocThoiGian: MOC_THOI_GIAN_THEO_THIET_LAP[maThietLap] || MOC_THOI_GIAN.HIEN_TAI
        };
    }

    resolveThoiDiemApDung(maThietLap, context = {}) {
        const cauHinh = this.getCauHinhThietLap(maThietLap);

        if (cauHinh.mocThoiGian === MOC_THOI_GIAN.HIEN_TAI) {
            return new Date();
        }

        const value = context[cauHinh.mocThoiGian];

        if (value === undefined || value === null || value === '') {
            throw new ApiError(
                400,
                `Thiết lập "${maThietLap}" yêu cầu mốc thời gian "${cauHinh.mocThoiGian}".`
            );
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new ApiError(
                400,
                `Mốc thời gian của thiết lập "${maThietLap}" không hợp lệ.`
            );
        }

        return date;
    }

    async getGiaTriRaw(maThietLap, context = {}, client) {
        const ma = String(maThietLap || '').trim().toUpperCase();
        const cauHinh = this.getCauHinhThietLap(ma);
        let coSoId =
            context.coSoId !== undefined &&
            context.coSoId !== null &&
            context.coSoId !== ''
                ? Number(context.coSoId)
                : null;

        if (cauHinh.quyTacCoSo === QUY_TAC_CO_SO.KHONG_CHO_CHON) {
            coSoId = null;
        }

        if (
            cauHinh.quyTacCoSo === QUY_TAC_CO_SO.BAT_BUOC &&
            (!Number.isInteger(coSoId) || coSoId <= 0)
        ) {
            throw new ApiError(400, `Thiết lập "${ma}" bắt buộc phải có cơ sở.`);
        }

        const thoiDiem = this.resolveThoiDiemApDung(ma, context);
        const thietLap = await cauHinhRepository.getGiaTriHieuLuc(
            ma,
            {
                coSoId,
                thoiDiem
            },
            client
        );

        const giaTri = thietLap?.gia_tri;

        if (
            giaTri === undefined ||
            giaTri === null ||
            String(giaTri).trim() === ''
        ) {
            const giaTriMacDinh =
                this.getGiaTriMacDinh(ma);

            if (giaTriMacDinh !== undefined) {
                return giaTriMacDinh;
            }

            return null;
        }

        return giaTri;
    }

    async getGiaTriPublic(ma) {
        if (!ma) {
            throw new ApiError(400, 'Mã thiết lập không được để trống.');
        }

        const maThietLap = String(ma).trim().toUpperCase();

        if (!PUBLIC_SETTINGS.has(maThietLap)) {
            throw new ApiError(
                403,
                'Thiết lập này không được phép truy cập công khai.'
            );
        }

        return this.getGiaTri(maThietLap);
    }

    async getGiaTri(ma) {
        if (!ma) {
            throw new ApiError(400, 'Mã thiết lập không được để trống.');
        }

        const maThietLap = String(ma).trim().toUpperCase();
        const thietLap = await cauHinhRepository.getThietLapByMa(maThietLap);

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            const giaTriMacDinh =
                this.getGiaTriMacDinh(maThietLap);

            if (giaTriMacDinh !== undefined) {
                return {
                    ma: maThietLap,
                    giaTri: giaTriMacDinh
                };
            }

            throw new ApiError(
                404,
                'Không tìm thấy thiết lập hoặc thiết lập đang tắt.'
            );
        }

        if (
            this.coGiaTriMacDinh(maThietLap) &&
            (
                thietLap.gia_tri === undefined ||
                thietLap.gia_tri === null ||
                String(thietLap.gia_tri).trim() === ''
            )
        ) {
            return {
                ma: maThietLap,
                giaTri:this.getGiaTriMacDinh(maThietLap)
            };
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

            case MA_THIET_LAP.QUY_TAC_LAM_TRON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getQuyTacLamTron()
                };

            case MA_THIET_LAP.SO_CHU_SO_SAU_DAU_PHAY:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoChuSoSauDauPhay()
                };

            case MA_THIET_LAP.BAT_BUOC_CHON_NHOM_MON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getBatBuocChonNhomMon()
                };

            case MA_THIET_LAP.THU_TU_DOI_TUONG_LAY_VE:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThuTuDoiTuongLayVe()
                };

            case MA_THIET_LAP.PHUONG_THUC_THANH_TOAN_HIEN_THI:
                return {
                    ma: maThietLap,
                    giaTri: await this.getPhuongThucThanhToanHienThi()
                };

            case MA_THIET_LAP.DINH_DANG_MA_VE_AN:
                return {
                    ma: maThietLap,
                    giaTri: await this.getDinhDangMaVeAn()
                };

            case MA_THIET_LAP.SO_PHUT_DAT_HANG_TRUOC:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoPhutDatHangTruoc()
                };

            case MA_THIET_LAP.DINH_DANG_SO_PHIEU_LAY_VE_AN:
            case MA_THIET_LAP.DINH_DANG_SO_PHIEU_KHO:
            case MA_THIET_LAP.DINH_DANG_MA_GIAO_DICH_DON_HANG:
            case MA_THIET_LAP.DINH_DANG_MA_THAM_CHIEU_DON_HANG:
            case MA_THIET_LAP.DINH_DANG_MA_CHUAN_CHI_DON_HANG:
            case MA_THIET_LAP.DINH_DANG_MA_GIAO_DICH_VE_AN:
            case MA_THIET_LAP.DINH_DANG_MA_THAM_CHIEU_VE_AN:
            case MA_THIET_LAP.DINH_DANG_MA_CHUAN_CHI_VE_AN:
                return {
                    ma: maThietLap,
                    giaTri: await this.getDinhDangSinhMa(maThietLap)
                };

            default:
                return this.resolveMacDinh(thietLap);
        }
    }

    async resolveLogoCoSoMacDinh(thietLap) {
        const maCoSo = thietLap.gia_tri?.trim();

        if (!maCoSo) {
            throw new ApiError(404, 'Chưa thiết lập cơ sở mặc định.');
        }

        const coSo = await cauHinhRepository.getCoSoByMa(maCoSo);

        if (!coSo) {
            throw new ApiError(404, 'Không tìm thấy cơ sở mặc định.');
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

        if (!thietLap || thietLap.active !== true) {
            return null;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soLan = Number(giaTri);

        if (!Number.isInteger(soLan) || soLan <= 0) {
            return null;
        }

        return soLan;
    }

    async getThoiGianKhoaTaiKhoan() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_KHOA_TAI_KHOAN
        );

        if (!thietLap || thietLap.active !== true) {
            return null;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim().toLowerCase();
        const match = giaTri.match(/^(\d+)\/(phut|gio|ngay|thang|nam)$/);

        if (!match) {
            return null;
        }

        const soLuong = Number(match[1]);
        const donVi = match[2];

        if (!Number.isInteger(soLuong) || soLuong <= 0) {
            return null;
        }

        return {
            soLuong,
            donVi
        };
    }

    async getSoPhutRefreshToken() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.THOI_GIAN_REFRESH_TOKEN);
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_REFRESH_TOKEN
        );

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (!Number.isInteger(soPhut) || soPhut <= 0) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getThoiGianTimeout() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_TIMEOUT
        );

        if (!thietLap || thietLap.active !== true) {
            return null;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soPhut = Number(giaTri);

        if (!Number.isInteger(soPhut) || soPhut <= 10) {
            return null;
        }

        return soPhut;
    }

    async getSoPhutAccessToken() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.THOI_GIAN_ACCESS_TOKEN);
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_ACCESS_TOKEN
        );

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (!Number.isInteger(soPhut) || soPhut <= 0) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getSidebarDongMacDinh() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG );
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG);
        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }
        const giaTri =String(thietLap.gia_tri ?? '')
                .trim()
                .toLowerCase();
        if (giaTri !== 'true' && giaTri !== 'false') {
            return MAC_DINH;
        }
        return giaTri === 'true';
    }

    async getThucDonTuanBatDauThuBay() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON);

        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();
        if (giaTri !== '0' && giaTri !== '1') {
            return MAC_DINH;
        }

        return giaTri === '1'
            ? 1
            : 0;
    }

    async getThucDonBatBuocDuSoNgay() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY);
        if (!thietLap || thietLap.active !== true) { return MAC_DINH; }
        const giaTri = String(thietLap.gia_tri ?? '')
            .trim()
            .toLowerCase();
        if (giaTri !== 'true' && giaTri !== 'false') { return MAC_DINH; }
        return giaTri === 'true';
    }

    async getSoTuanHienThiThucDon() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soTuan = Number(giaTri);

        if (!Number.isInteger(soTuan) || soTuan <= 0) {
            return MAC_DINH;
        }

        return soTuan;
    }

    async getSoNamHienThiThucDonThang() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG);
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG
        );

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soNam = Number(giaTri);

        if (!Number.isInteger(soNam) || soNam <= 0) {
            return MAC_DINH;
        }

        return soNam;
    }

    async getQuyTacChonDonViQuyDoi() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(thietLap.gia_tri ?? '').trim()
        );

        if (
            !Number.isInteger(giaTri) ||
            ![
                1,
                2,
                3,
                4
            ].includes(giaTri)
        ) {
            return MAC_DINH;
        }

        return giaTri;
    }

    async getQuyTacLamTron() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.QUY_TAC_LAM_TRON);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.QUY_TAC_LAM_TRON);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(thietLap.gia_tri ?? '').trim()
        );

        if (
            !Number.isInteger(giaTri) ||
            ![
                0,
                1,
                2
            ].includes(giaTri)
        ) {
            return MAC_DINH;
        }

        return giaTri;
    }

    async getSoChuSoSauDauPhay() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.SO_CHU_SO_SAU_DAU_PHAY);
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_CHU_SO_SAU_DAU_PHAY
        );

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(thietLap.gia_tri ?? '').trim()
        );

        if (
            !Number.isInteger(giaTri) ||
            giaTri < 0 ||
            giaTri > 5
        ) {
            return MAC_DINH;
        }

        return giaTri;
    }

    async getBatBuocChonNhomMon() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.BAT_BUOC_CHON_NHOM_MON);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.BAT_BUOC_CHON_NHOM_MON);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '').trim().toLowerCase();

        if (
            giaTri !== 'true' &&
            giaTri !== 'false'
        ) {
            return MAC_DINH;
        }

        return giaTri === 'true';
    }

    async getThuTuDoiTuongLayVe() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.THU_TU_DOI_TUONG_LAY_VE);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.THU_TU_DOI_TUONG_LAY_VE);

        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(thietLap.gia_tri ?? '').trim()
        );

        if (
            !Number.isInteger(giaTri) ||
            ![
                1,
                2,
                3,
                4,
                5,
                6
            ].includes(giaTri)
        ) {
            return MAC_DINH;
        }

        return giaTri;
    }

    async getPhuongThucThanhToanHienThi() {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.PHUONG_THUC_THANH_TOAN_HIEN_THI);
        const thietLap = await cauHinhRepository.getThietLapByMa(MA_THIET_LAP.PHUONG_THUC_THANH_TOAN_HIEN_THI);
        if (!thietLap || thietLap.active !== true) {
            return MAC_DINH;
        }

        const giaTri = String(thietLap.gia_tri ?? '')
            .split(',')
            .map(item => Number(item.trim()))
            .filter(item =>
                [
                    10,
                    20,
                    30
                ].includes(item)
            );

        const danhSach = [
            ...new Set(giaTri)
        ];

        if (danhSach.length === 0) {
            return MAC_DINH;
        }

        return danhSach;
    }

    chuanHoaTienToSinhMa(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
    }

    parseDinhDangSinhMa(value) {
        const text = String(value ?? '').trim();

        if (!text) {
            return null;
        }

        const tokens = text.match(/\[[^\[\]]+\]/g);

        if (
            !tokens ||
            tokens.join('') !== text
        ) {
            return null;
        }

        let index = 0;
        let tienTo = '';

        const firstToken = String(tokens[index] || '').toLowerCase();

        if (firstToken !== '[yy]') {
            if (
                firstToken === '[mm]' ||
                firstToken === '[dd]' ||
                firstToken.startsWith('[dayso:')
            ) {
                return null;
            }

            const rawPrefix = String(tokens[index] || '').slice(1, -1);
            tienTo = this.chuanHoaTienToSinhMa(rawPrefix);

            if (!tienTo) {
                return null;
            }

            index += 1;
        }

        if (
            String(tokens[index] || '').toLowerCase() !==
            '[yy]'
        ) {
            return null;
        }

        const coYY = true;
        index += 1;
        let coMM = false;

        if (
            String(tokens[index] || '').toLowerCase() ===
            '[mm]'
        ) {
            coMM = true;
            index += 1;
        }

        let coDD = false;

        if (
            String(tokens[index] || '').toLowerCase() ===
            '[dd]'
        ) {
            if (!coMM) {
                return null;
            }

            coDD = true;
            index += 1;
        }

        let doRongDaySo = 5;

        if (index < tokens.length) {
            const daySoMatch = String(tokens[index]).match(
                /^\[dayso:(\d+)\]$/i
            );

            if (!daySoMatch) {
                return null;
            }

            const doRong = Number(daySoMatch[1]);

            if (
                !Number.isInteger(doRong) ||
                doRong <= 0
            ) {
                return null;
            }

            doRongDaySo = doRong;
            index += 1;
        }

        if (index !== tokens.length) {
            return null;
        }

        const parts = [];

        if (tienTo) {
            parts.push(`[${tienTo}]`);
        }

        parts.push('[yy]');

        if (coMM) {
            parts.push('[mm]');
        }

        if (coDD) {
            parts.push('[dd]');
        }

        parts.push(`[dayso:${doRongDaySo}]`);

        return {
            dinhDang: parts.join(''),
            tienTo,
            coYY,
            coMM,
            coDD,
            doRongDaySo,
            resetTheo: coDD
                ? 'day'
                : coMM
                    ? 'month'
                    : 'year'
        };
    }

    taoNguCanhSinhMa(cauHinh, date = new Date()) {
        const yyyy = String(date.getFullYear());
        const yy = yyyy.slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        let prefix = cauHinh.tienTo;
        if (cauHinh.coYY) { prefix += yy; }
        if (cauHinh.coMM) { prefix += mm; }
        if (cauHinh.coDD) { prefix += dd; }
        return {
            prefix,
            doRongDaySo: cauHinh.doRongDaySo,
            khoa: [ cauHinh.dinhDang, prefix ].join(':')
        };
    }

    async getQuyTacSinhMa(maThietLap) {
        const ma = String(maThietLap || '').trim().toUpperCase();

        if (!laThietLapDinhDangMa(ma)) {
            throw new ApiError(
                400,
                `Thiết lập "${ma}" không phải thiết lập định dạng sinh mã.`
            );
        }

        const MAC_DINH = getDinhDangMaMacDinh(ma);
        const cauHinhMacDinh = this.parseDinhDangSinhMa(MAC_DINH);
        const thietLap = await cauHinhRepository.getThietLapByMa(ma);

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return cauHinhMacDinh;
        }

        return (
            this.parseDinhDangSinhMa(thietLap.gia_tri) ||
            cauHinhMacDinh
        );
    }

    async getDinhDangSinhMa(maThietLap) {
        const cauHinh = await this.getQuyTacSinhMa(maThietLap);

        return cauHinh.dinhDang;
    }

    chuanHoaTienToMaVeAn(value) {
        return this.chuanHoaTienToSinhMa(value);
    }

    parseDinhDangMaVeAn(value) {
        return this.parseDinhDangSinhMa(value);
    }

    async getQuyTacSinhMaVeAn() {
        return this.getQuyTacSinhMa(
            MA_THIET_LAP.DINH_DANG_MA_VE_AN
        );
    }

    async getDinhDangMaVeAn() {
        return this.getDinhDangSinhMa(
            MA_THIET_LAP.DINH_DANG_MA_VE_AN
        );
    }

    async getSoPhutDatHangTruoc(context = {}, client) {
        const MAC_DINH = this.getGiaTriMacDinh(MA_THIET_LAP.SO_PHUT_DAT_HANG_TRUOC);
        const raw = await this.getGiaTriRaw(
            MA_THIET_LAP.SO_PHUT_DAT_HANG_TRUOC,
            context,
            client
        );

        if (
            raw === null ||
            String(raw).trim() === ''
        ) {
            return MAC_DINH;
        }

        const text = String(raw).trim();

        if (!/^\d+$/.test(text)) {
            return MAC_DINH;
        }

        const value = Number(text);

        return (
            Number.isInteger(value) &&
            value <= 1440
                ? value
                : MAC_DINH
        );
    }

}

module.exports = new CauHinhGiaTriService();