'use strict';

const ApiError = require('../../../utils/api-error');

const {
    successResponse
} = require('../../../utils/response.util');

const gioHangService = require(
    '../../nghiep-vu/dat-hang/gio-hang/gio-hang.service'
);

const services = {
    dh01: require('./dh01/dh01.service'),
    dh02: require('./dh02/dh02.service'),
    dh03: require('./dh03/dh03.service'),
    dh04: require('./dh04/dh04.service'),
    dh05: require('./dh05/dh05.service')
};

async function layBoLocTheoQuyen(req) {
    const profile = await gioHangService.getNhanVien(
        req.user?.nhanVienId
    );

    const coSoId = Number(profile.coSoId);

    if (!Number.isSafeInteger(coSoId) || coSoId <= 0) {
        throw new ApiError(403, 'Chưa xác định được cơ sở được phép xem.');
    }

    const requestedIds = req.body.coSoIds || [];

    if (requestedIds.some(id => Number(id) !== coSoId)) {
        throw new ApiError(
            403,
            'Bạn chỉ được xem báo cáo đơn hàng thuộc cơ sở của mình.'
        );
    }

    return {
        ...req.body,
        coSoIds: [coSoId]
    };
}

function taoHandler(service) {
    return async (req, res, next) => {
        try {
            const filters = await layBoLocTheoQuyen(req);

            const data = await service.taoBaoCao(
                filters,
                req.user.taiKhoanId
            );

            return successResponse(
                res,
                'Lấy báo cáo đơn hàng thành công.',
                data,
                200
            );
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    dh01: taoHandler(services.dh01),
    dh02: taoHandler(services.dh02),
    dh03: taoHandler(services.dh03),
    dh04: taoHandler(services.dh04),
    dh05: taoHandler(services.dh05)
};