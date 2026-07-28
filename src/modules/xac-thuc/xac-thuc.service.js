const md5 = require("../../utils/md5");
const jwt = require("../../utils/jwt");

const ApiError = require("../../utils/api-error");

const authRepository = require("./xac-thuc.repository");
const thietLapRepository = require("../thiet-lap/thiet-lap.repository");

class XacThucService {

    async login(username, password) {

        const account = await authRepository.findByUsername(
            username
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
            account.khoa_den &&
            new Date(account.khoa_den) > new Date()
        ) {

            throw new ApiError(
                423,
                "Tài khoản đang bị khóa tạm thời."
            );

        }

        const isCorrectPassword = md5.compare(
            password,
            account.mat_khau_hash
        );

        if (!isCorrectPassword) {

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

                throw new Error(
                    `Tài khoản đã bị khóa tạm thời ${lockMinutes} phút.`
                );

            }

            throw new Error(
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

            taiKhoanId: account.id,

            nhanVienId: account.nhan_vien_id,

            username: account.ten_dang_nhap,

            roles: account.vai_tros

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

            firstLogin: account.doi_mat_khau_lan_dau,

            user: {

                id: account.id,

                nhanVienId: account.nhan_vien_id,

                maNhanVien: account.ma_nhan_vien,

                hoTen: account.ho_ten,

                username: account.ten_dang_nhap,

                roles: account.vai_tros

            }

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

            taiKhoanId: account.id,

            nhanVienId: account.nhan_vien_id,

            username: account.ten_dang_nhap,

            roles: account.vai_tros

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
    async changePassword(
        taiKhoanId,
        oldPassword,
        newPassword
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

        const password =
            await authRepository.getPasswordHash(
                taiKhoanId
            );

        const isCorrect =
            md5.compare(
                oldPassword,
                password.mat_khau_hash
            );

        if (!isCorrect) {

            throw new ApiError(
                400,
                "Mật khẩu cũ không đúng."
            );

        }

        if (oldPassword === newPassword) {

            throw new ApiError(
                400,
                "Mật khẩu mới phải khác mật khẩu cũ."
            );

        }

        const passwordHash =
            md5.hash(
                newPassword
            );

        await authRepository.changePassword(

            taiKhoanId,

            passwordHash

        );

        await authRepository.revokeAllRefreshToken(
            taiKhoanId
        );

        return;

    }

    async getProfile() {

    }

}

module.exports = new XacThucService();