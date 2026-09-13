'use strict';

const tc01Service = require('./tc01/tc01.service');
const tc02Service = require('./tc02/tc02.service');
const tc03Service = require('./tc03/tc03.service');

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

}


module.exports =
    new TaiChinhController();