'use strict';

const tc01Service = require(
    './tc01/tc01.service'
);


const {
    successResponse
} = require(
    '../../../utils/response.util'
);


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

}


module.exports =
    new TaiChinhController();