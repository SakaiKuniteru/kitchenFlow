'use strict';

const va01Service = require('./va01/va01.service');
const va02Service = require('./va02/va02.service');
const va03Service = require('./va03/va03.service');
const va04Service = require('./va04/va04.service');
const va05Service = require('./va05/va05.service');

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

    async va04(req, res, next) {
        try {
            const data = await va04Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo suất ăn theo phòng ban thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async va05(req, res, next) {
        try {
            const data = await va05Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo vé ăn hủy thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VeAnController();