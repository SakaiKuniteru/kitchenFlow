const md5 = require("../../../../utils/md5");
const jwt = require("../../../../utils/jwt");

const ApiError = require("../../../../utils/api-error");

const authRepository = require("./xac-thuc.repository");
const thietLapRepository = require("../../he-thong/thiet-lap/thiet-lap.repository");

class XacThucService {

    async login(taiKhoan, matKhau) {

        const account = await authRepository.findByTaiKhoan(
            taiKhoan
        );

        if (!account) {

            throw new ApiError(
                401,
                "Sai tài khoản hoặc mật khẩu."
            );

        }

        if (!account.active) {

            throw new ApiError(
                403,
                "Tài khoản đã bị khóa."
            );

        }

        if (
            account.khoaDen &&
            new Date(account.khoaDen) > new Date()
        ) {

            throw new ApiError(
                423,
                "Tài khoản đang bị khóa tạm thời."
            );

        }

        const isCorrectMatKhau = md5.compare(
            matKhau,
            account.matKhauHash
        );

        if (!isCorrectMatKhau) {

            await authRepository.increaseFailedLogin(
                account.id
            );

            const failedLoginCount =
                await authRepository.getFailedLoginCount(
                    account.id
                );

            const maxFailedLogin = Number(
                await thietLapRepository.getGiaTriTheoMa(
                    "SO_LAN_DANG_NHAP_SAI_TOI_DA"
                )
            );

            const lockMinutes = Number(
                await thietLapRepository.getGiaTriTheoMa(
                    "THOI_GIAN_KHOA_TAI_KHOAN"
                )
            );

            const isLocked =
                failedLoginCount >= maxFailedLogin;

            if (isLocked) {

                const lockUntil = new Date(
                    Date.now() + lockMinutes * 60 * 1000
                );

                await authRepository.lockAccount(
                    account.id,
                    lockUntil
                );

                throw new ApiError(
                    423,
                    `Tài khoản đã bị khóa tạm thời ${lockMinutes} phút.`
                );

            }

            throw new ApiError(
                401,
                "Sai tài khoản hoặc mật khẩu."
            );

        };

        await authRepository.resetFailedLogin(
            account.id
        );

        await authRepository.updateLastLogin(
            account.id
        );

        const payload = {

            taiKhoanId:
                account.id,

            nhanVienId:
                account.nhanVienId,

            taiKhoan:
                account.taiKhoan,

            roles:
                account.roles,

            dsVaiTroId:
                account.dsVaiTroId,

            dsQuyenId:
                account.dsQuyenId

        };

        const accessToken =
            jwt.generateAccessToken(payload);

        const refreshToken =
            jwt.generateRefreshToken(payload);

        const refreshExpiresAt = new Date();

        const refreshTokenDays = Number(
            await thietLapRepository.getGiaTriTheoMa(
                "SO_NGAY_REFRESH_TOKEN"
            )
        );

        refreshExpiresAt.setDate(
            refreshExpiresAt.getDate() + refreshTokenDays
        );

        await authRepository.saveRefreshToken(

            account.id,

            refreshToken,

            refreshExpiresAt

        );

        return {

            accessToken,

            refreshToken,

            id:
                account.id,

            nhanVienId:
                account.nhanVienId,

            maNhanVien:
                account.maNhanVien,

            hoTen:
                account.hoTen,

            taiKhoan:
                account.taiKhoan,

            firstLogin:
                account.doiMatKhauLanDau,

            email:
                account.email,

            soDienThoai:
                account.soDienThoai,

            anhDaiDien:
                account.anhDaiDien,

            ngaySinh:
                account.ngaySinh,

            gioiTinh:
                account.gioiTinh,

            diaChi:
                account.diaChi,

            ghiChu:
                account.ghiChu,

            maThe:
                account.maThe,

            maQr:
                account.maQr,

            maBarcode:
                account.maBarcode,

            quocGiaId:
                account.quocGiaId,

            tinhThanhId:
                account.tinhThanhId,

            xaPhuongId:
                account.xaPhuongId,

            roles:
                account.roles,

            dsVaiTroId:
                account.dsVaiTroId,

            dsVaiTro:
                account.dsVaiTro,

            coSoId:
                account.coSoId,

            coSo:
                account.coSo,

            phongBanId:
                account.phongBanId,

            phongBan:
                account.phongBan,

            chucVuId:
                account.chucVuId,

            chucVu:
                account.chucVu,

            dsQuyenId:
                account.dsQuyenId,

            dsQuyen:
                account.dsQuyen,

            active:
                account.active,

            createdAt:
                account.createdAt,

            updatedAt:
                account.updatedAt

        };

    }

    async refreshToken(refreshToken) {

        if (!refreshToken) {

            throw new ApiError(
                401,
                "Refresh Token không hợp lệ."
            );

        }

        let payload;

        try {

            payload = jwt.verifyRefreshToken(
                refreshToken
            );

        } catch {

            throw new ApiError(
                401,
                "Refresh Token đã hết hạn."
            );

        }

        const tokenInDb =
            await authRepository.findRefreshToken(
                refreshToken
            );

        if (!tokenInDb) {

            throw new ApiError(
                401,
                "Refresh Token không tồn tại."
            );

        }

        if (tokenInDb.revoked) {

            throw new ApiError(
                401,
                "Refresh Token đã bị thu hồi."
            );

        }

        if (
            new Date(tokenInDb.expires_at) < new Date()
        ) {

            throw new ApiError(
                401,
                "Refresh Token đã hết hạn."
            );

        }

        const account =
            await authRepository.findById(
                tokenInDb.tai_khoan_id
            );

        if (!account) {

            throw new ApiError(
                401,
                "Tài khoản không tồn tại."
            );

        }

        const newPayload = {

            taiKhoanId:
                account.id,

            nhanVienId:
                account.nhanVienId,

            taiKhoan:
                account.taiKhoan,

            roles:
                account.roles,

            dsVaiTroId:
                account.dsVaiTroId,

            dsQuyenId:
                account.dsQuyenId

        };

        const newAccessToken =
            jwt.generateAccessToken(newPayload);

        const newRefreshToken =
            jwt.generateRefreshToken(newPayload);

        await authRepository.revokeRefreshToken(
            refreshToken
        );

        const expiresAt = new Date();

        const refreshTokenDays = Number(
            await thietLapRepository.getGiaTriTheoMa(
                "SO_NGAY_REFRESH_TOKEN"
            )
        );

        expiresAt.setDate(
            expiresAt.getDate() + refreshTokenDays
        );

        await authRepository.saveRefreshToken(
            account.id,
            newRefreshToken,
            expiresAt
        );

        return {

            accessToken: newAccessToken,

            refreshToken: newRefreshToken

        };

    }

    async logout(refreshToken) {

        if (!refreshToken) {

            throw new ApiError(
                400,
                "Refresh Token không được để trống."
            );

        }

        const tokenInDb =
            await authRepository.findRefreshToken(
                refreshToken
            );

        if (!tokenInDb) {

            throw new ApiError(
                401,
                "Refresh Token không hợp lệ."
            );

        }

        jwt.verifyRefreshToken(
            refreshToken
        );

        await authRepository.revokeRefreshToken(
            refreshToken
        );

        return;

    }
    async changeMatKhau(
        taiKhoanId,
        matKhauCu,
        matKhauMoi
    ) {

        const account =
            await authRepository.findById(
                taiKhoanId
            );

        if (!account) {

            throw new ApiError(
                404,
                "Tài khoản không tồn tại."
            );

        }

        const matKhau =
            await authRepository.getMatKhauHash(
                taiKhoanId
            );

        const isCorrect =
            md5.compare(
                matKhauCu,
                matKhau.mat_khau_hash
            );

        if (!isCorrect) {

            throw new ApiError(
                400,
                "Mật khẩu cũ không đúng."
            );

        }

        if (matKhauCu === matKhauMoi) {

            throw new ApiError(
                400,
                "Mật khẩu mới phải khác mật khẩu cũ."
            );

        }

        const matKhauHash =
            md5.hash(
                matKhauMoi
            );

        await authRepository.changeMatKhau(

            taiKhoanId,

            matKhauHash

        );

        await authRepository.revokeAllRefreshToken(
            taiKhoanId
        );

        return;

    }

}

module.exports = new XacThucService();