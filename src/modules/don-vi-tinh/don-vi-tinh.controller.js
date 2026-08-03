const fs = require("fs");

const donViTinhService = require("./don-vi-tinh.service");

const { successResponse } = require("../../utils/response.util");

class DonViTinhController {

    async getTongHop(req, res, next) {

        try {

            const data =
                await donViTinhService
                    .getTongHop(
                        req.query
                    );

            return successResponse(
                res,
                "Lấy danh sách đơn vị tính thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

    async exportData(
        req,
        res,
        next
    ) {

        let fileTam = null;

        try {

            const data =
                await donViTinhService
                    .exportData();

            fileTam =
                data.path;

            res.setHeader(
                "Content-Type",
                data.contentType
            );

            return res.download(
                data.path,
                data.fileName,
                error => {

                    if (
                        fileTam &&
                        fs.existsSync(fileTam)
                    ) {

                        fs.unlinkSync(
                            fileTam
                        );

                    }

                    if (error) {
                        next(error);
                    }

                }
            );

        } catch (error) {

            if (
                fileTam &&
                fs.existsSync(fileTam)
            ) {

                fs.unlinkSync(
                    fileTam
                );

            }

            next(error);

        }

    }

    async importData(
        req,
        res,
        next
    ) {

        let duongDanFileTam =
            null;

        try {

            const result =
                await donViTinhService
                    .importData(
                        req.file
                    );

            duongDanFileTam =
                result.path;

            res.setHeader(
                "Content-Type",
                result.contentType
            );

            res.setHeader(
                "X-Import-Status",
                result.coLoi
                    ? "error"
                    : "success"
            );

            res.setHeader(
                "X-Import-Total",
                String(
                    result.tongSoDong
                )
            );

            res.setHeader(
                "X-Import-Errors",
                String(
                    result.soDongLoi
                )
            );

            return res.download(

                result.path,

                result.fileName,

                error => {

                    if (
                        duongDanFileTam &&
                        fs.existsSync(
                            duongDanFileTam
                        )
                    ) {

                        fs.unlinkSync(
                            duongDanFileTam
                        );

                    }

                    if (error) {
                        next(error);
                    }

                }

            );

        } catch (error) {

            if (
                duongDanFileTam &&
                fs.existsSync(
                    duongDanFileTam
                )
            ) {

                fs.unlinkSync(
                    duongDanFileTam
                );

            }

            next(error);

        }

    }

    async getChiTiet(req, res, next) {

        try {

            const { id } =
                req.params;

            const data =
                await donViTinhService
                    .getChiTiet(id);

            return successResponse(
                res,
                "Lấy chi tiết đơn vị tính thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

    async create(req, res, next) {

        try {

            const data =
                await donViTinhService
                    .create(
                        req.body
                    );

            return successResponse(
                res,
                "Thêm đơn vị tính thành công.",
                data,
                201
            );

        } catch (error) {

            next(error);

        }

    }

    async update(req, res, next) {

        try {

            const { id } =
                req.params;

            const data =
                await donViTinhService
                    .update(
                        id,
                        req.body
                    );

            return successResponse(
                res,
                "Cập nhật đơn vị tính thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

}

module.exports =
    new DonViTinhController();