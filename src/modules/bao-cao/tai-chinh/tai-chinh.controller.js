'use strict';

const tc01Service = require('./tc01/tc01.service');
const tc02Service = require('./tc02/tc02.service');
const tc03Service = require('./tc03/tc03.service');
const tc04Service = require('./tc04/tc04.service');
const tc05Service = require('./tc05/tc05.service');

const { successResponse } = require('../../../utils/response.util');

class TaiChinhController {

    async tc01(
        req,
        res,
        next
    ) {
        try {

            const data =
                await tc01Service
                    .taoBaoCao(
                        req.body,
                        req.user?.taiKhoanId ||
                        req.user?.id
                    );


            return successResponse(
                res,
                'Lấy thông tin báo cáo chi tiết thu chi thành công.',
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }
    }

    async tc02(req, res, next) {
        try {
            const data = await tc02Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo đối soát thanh toán vé ăn thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async tc03(req, res, next) {
        try {
            const data = await tc03Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo các khoản vé ăn chưa thanh toán thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async tc04(req, res, next) {
        try {
            const data = await tc04Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo miễn giảm và ưu đãi thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async tc05(req, res, next) {
        try {
            const data = await tc05Service.taoBaoCao(
                req.body,
                req.user?.taiKhoanId || req.user?.id
            );

            return successResponse(
                res,
                'Lấy báo cáo tổng hợp tiền thu theo người thu thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    }

}


module.exports =
    new TaiChinhController();