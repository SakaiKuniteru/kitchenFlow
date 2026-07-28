const ApiError = require("../../utils/api-error");

const xacThucService = require("./xac-thuc.service");

class XacThucController {

    async login(req, res, next) {

        try {

            const {

                username,

                password

            } = req.body;

            if (!username || !password) {

                throw new ApiError(
                    400,
                    "Tên đăng nhập và mật khẩu không được để trống."
                );

            }

            const result =
                await xacThucService.login(
                    username,
                    password
                );

            return res.status(200).json({

                success: true,

                message: "Đăng nhập thành công.",

                data: result

            });

        }
        catch (error) {

            next(error);

        }

    }

    async refreshToken(req, res, next) {

        try {

            const { refreshToken } = req.body;

            const result =
                await xacThucService.refreshToken(
                    refreshToken
                );

            return res.status(200).json({

                success: true,

                message: "Làm mới Access Token thành công.",

                data: result

            });

        } catch (error) {

            next(error);

        }

    }

    async logout(req, res, next) {

        try {

            const {

                refreshToken

            } = req.body;

            await xacThucService.logout(
                refreshToken
            );

            res.json({

                success: true,

                message: "Đăng xuất thành công."

            });

        }
        catch (error) {

            next(error);

        }

    }

    // async getProfile(req, res, next) {

    //     try {

    //         const userId = req.user.id;

    //         const profile =
    //             await xacThucService.getProfile(
    //                 userId
    //             );

    //         return res.status(200).json({

    //             success: true,

    //             message: "Lấy thông tin cá nhân thành công.",

    //             data: profile

    //         });

    //     }
    //     catch (error) {

    //         next(error);

    //     }

    // }

    async getProfile(req, res) {

        res.json({

            success: true,

            data: req.user

        });

    }

    async changePassword(req, res, next) {

        try {

            const {

                oldPassword,

                newPassword

            } = req.body;

            await xacThucService.changePassword(

                req.user.taiKhoanId,

                oldPassword,

                newPassword

            );

            res.json({

                success: true,

                message: "Đổi mật khẩu thành công."

            });

        }
        catch (error) {

            next(error);

        }

    }
}

module.exports = new XacThucController();