'use strict';

const { successResponse } = require('../../../utils/response.util');

const services = {
    td01: require('./td01/td01.service'),
    td02: require('./td02/td02.service'),
    td03: require('./td03/td03.service'),
    td04: require('./td04/td04.service'),
    td05: require('./td05/td05.service'),
    td06: require('./td06/td06.service')
};


/*
 * ==========================================
 * HANDLER CHUNG
 * ==========================================
 */

function taoHandler(
    service
) {

    return async (
        req,
        res,
        next
    ) => {

        try {

            const taiKhoanId =
                req.user
                    ?.taiKhoanId ??
                req.user
                    ?.id;


            const data =
                await service
                    .taoBaoCao(
                        req.body,
                        taiKhoanId
                    );


            return successResponse(
                res,
                'Lấy báo cáo thực đơn thành công.',
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

    };

}


module.exports = {
    td01: taoHandler(services.td01),
    td02: taoHandler(services.td02),
    td03: taoHandler(services.td03),
    td04: taoHandler(services.td04),
    td05: taoHandler(services.td05),
    td06: taoHandler(services.td06)
};