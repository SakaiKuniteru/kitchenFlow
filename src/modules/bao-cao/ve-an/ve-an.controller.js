'use strict';

const va01Service = require('./va01/va01.service');
const va02Service = require('./va02/va02.service');
const va03Service = require('./va03/va03.service');

const {
    successResponse
} = require('../../../utils/response.util');

class VeAnController {
    async va01(req, res, next) {
        try {
            const data = await va01Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo tổng hợp vé ăn thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async va02(req, res, next) {
        try {
            const data = await va02Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo chi tiết vé ăn thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async va03(req, res, next) {
        try {
            const data = await va03Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo đăng ký và sử dụng vé ăn thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VeAnController();