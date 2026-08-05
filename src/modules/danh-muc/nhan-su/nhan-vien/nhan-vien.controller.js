const nhanVienService = require("./nhan-vien.service");

const { successResponse } = require( "../../../../utils/response.util" );

class NhanVienController {

    async getTongHop(req, res, next) {

        try {

            const data =
                await nhanVienService.getTongHop();

            return successResponse(
                res,
                "Lấy danh mục nhân viên thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

    async getChiTiet(req, res, next) {

        try {

            const data =
                await nhanVienService.getChiTiet(
                    req.params.id
                );

            return successResponse(
                res,
                "Lấy chi tiết nhân viên thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

    async create(
        req,
        res,
        next
    ) {

        try {

            const data = {

                ...(req.body || {})

            };

            if (
                req.file
            ) {

                data.anhDaiDien =
                    `/uploads/nhan-vien/${req.file.filename}`;

            }

            const result =
                await nhanVienService.create(
                    data
                );

            return res.status(201).json({

                success: true,

                message:
                    "Thêm nhân viên thành công.",

                data: result

            });

        } catch (error) {

            next(error);

        }

    }

    async update(
        req,
        res,
        next
    ) {

        try {

            const data = {

                ...(req.body || {})

            };

            if (
                req.file
            ) {

                data.anhDaiDien =
                    `uploads/nhan-vien/${req.file.filename}`;

            }

            const result =
                await nhanVienService
                    .update(
                        req.params.id,
                        data
                    );

            return res.status(200).json({

                success:
                    true,

                message:
                    "Cập nhật nhân viên thành công.",

                data:
                    result

            });

        } catch (error) {

            next(
                error
            );

        }

    }

}

module.exports = new NhanVienController();