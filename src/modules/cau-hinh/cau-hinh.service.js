"use strict";

const ApiError = require( "../../utils/api-error" );

const cauHinhRepository = require( "./cau-hinh.repository" );

const MA_THIET_LAP = {

    TEN_HE_THONG:
        "TEN_HE_THONG",

    LOGO_CO_SO_MAC_DINH:
        "LOGO_CO_SO_MAC_DINH",

    SO_LAN_DANG_NHAP_SAI_TOI_DA:
        "SO_LAN_DANG_NHAP_SAI_TOI_DA",

    THOI_GIAN_KHOA_TAI_KHOAN:
        "THOI_GIAN_KHOA_TAI_KHOAN",

    THOI_GIAN_ACCESS_TOKEN:
        "THOI_GIAN_ACCESS_TOKEN",

    THOI_GIAN_REFRESH_TOKEN:
        "THOI_GIAN_REFRESH_TOKEN",

    THOI_GIAN_TIMEOUT:
        "THOI_GIAN_TIMEOUT"

};

class CauHinhService {

    async getGiaTriPublic(
        ma
    ) {

        if (!ma) {

            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );

        }


        const maThietLap =
            String(
                ma
            )
                .trim()
                .toUpperCase();


        const PUBLIC_SETTINGS =
            new Set([

                MA_THIET_LAP
                    .TEN_HE_THONG,

                MA_THIET_LAP
                    .LOGO_CO_SO_MAC_DINH

            ]);


        if (
            !PUBLIC_SETTINGS.has(
                maThietLap
            )
        ) {

            throw new ApiError(
                403,
                "Thiết lập này không được phép truy cập công khai."
            );

        }


        return this.getGiaTri(
            maThietLap
        );

    }

    async getGiaTri(
        ma
    ) {

        if (!ma) {

            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );

        }

        const maThietLap =
            String(
                ma
            )
                .trim()
                .toUpperCase();


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    maThietLap
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            throw new ApiError(
                404,
                "Không tìm thấy thiết lập hoặc thiết lập đang tắt."
            );

        }


        switch (
            maThietLap
        ) {

            case MA_THIET_LAP
                .LOGO_CO_SO_MAC_DINH:

                return this
                    .resolveLogoCoSoMacDinh(
                        thietLap
                    );


            default:

                return this
                    .resolveMacDinh(
                        thietLap
                    );

        }

    }


    async resolveLogoCoSoMacDinh(
        thietLap
    ) {

        const maCoSo =
            thietLap.gia_tri
                ?.trim();


        if (!maCoSo) {

            throw new ApiError(
                404,
                "Chưa thiết lập cơ sở mặc định."
            );

        }


        const coSo =
            await cauHinhRepository
                .getCoSoByMa(
                    maCoSo
                );


        if (!coSo) {

            throw new ApiError(
                404,
                "Không tìm thấy cơ sở mặc định."
            );

        }


        return {

            ma:
                thietLap.ma_thiet_lap,

            giaTri:
                coSo.logo

        };

    }


    resolveMacDinh(
        thietLap
    ) {

        return {

            ma:
                thietLap.ma_thiet_lap,

            giaTri:
                thietLap.gia_tri

        };

    }


    async getSoLanDangNhapSaiToiDa() {

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .SO_LAN_DANG_NHAP_SAI_TOI_DA
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return null;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            ).trim();


        if (
            !/^\d+$/.test(
                giaTri
            )
        ) {

            return null;

        }


        const soLan =
            Number(
                giaTri
            );


        if (
            !Number.isInteger(
                soLan
            ) ||
            soLan <= 0
        ) {

            return null;

        }


        return soLan;

    }

    async getThoiGianKhoaTaiKhoan() {

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .THOI_GIAN_KHOA_TAI_KHOAN
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return null;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            )
                .trim()
                .toLowerCase();


        const match =
            giaTri.match(
                /^(\d+)\/(phut|gio|ngay|thang|nam)$/
            );


        if (!match) {

            return null;

        }


        const soLuong =
            Number(
                match[1]
            );


        const donVi =
            match[2];


        if (
            !Number.isInteger(
                soLuong
            ) ||
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

        const MAC_DINH =
            20;


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .THOI_GIAN_REFRESH_TOKEN
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            ).trim();


        if (
            !/^\d+$/.test(
                giaTri
            )
        ) {

            return MAC_DINH;

        }


        const soPhut =
            Number(
                giaTri
            );


        if (
            !Number.isInteger(
                soPhut
            ) ||
            soPhut <= 0
        ) {

            return MAC_DINH;

        }


        return soPhut;

    }

    async getThoiGianTimeout() {

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .THOI_GIAN_TIMEOUT
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return null;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            ).trim();


        if (
            !/^\d+$/.test(
                giaTri
            )
        ) {

            return null;

        }


        const soPhut =
            Number(
                giaTri
            );


        if (
            !Number.isInteger(
                soPhut
            ) ||
            soPhut <= 10
        ) {

            return null;

        }


        return soPhut;

    }

    async getSoPhutAccessToken() {

        const MAC_DINH =
            20;


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .THOI_GIAN_ACCESS_TOKEN
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            ).trim();


        if (
            !/^\d+$/.test(
                giaTri
            )
        ) {

            return MAC_DINH;

        }


        const soPhut =
            Number(
                giaTri
            );


        if (
            !Number.isInteger(
                soPhut
            ) ||
            soPhut <= 0
        ) {

            return MAC_DINH;

        }


        return soPhut;

    }
}


module.exports =
    new CauHinhService();