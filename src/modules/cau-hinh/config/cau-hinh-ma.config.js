'use strict';

const { MA_THIET_LAP } = require('../cau-hinh.constants');

const DINH_DANG_MA_MAC_DINH =
    Object.freeze({
        [MA_THIET_LAP.DINH_DANG_MA_VE_AN]: '[MVA][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_SO_PHIEU_LAY_VE_AN]: '[SPLV][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_SO_PHIEU_KHO]: '[SPK][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_GIAO_DICH_DON_HANG]: '[GDDH][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_THAM_CHIEU_DON_HANG]: '[TCDH][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_CHUAN_CHI_DON_HANG]: '[CCDH][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_GIAO_DICH_VE_AN]: '[GDVA][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_THAM_CHIEU_VE_AN]: '[TCVA][yy][mm][dd][dayso:5]',
        [MA_THIET_LAP.DINH_DANG_MA_CHUAN_CHI_VE_AN]: '[CCVA][yy][mm][dd][dayso:5]'

    });

function laThietLapDinhDangMa(maThietLap) {
    return Object.prototype
        .hasOwnProperty
        .call(DINH_DANG_MA_MAC_DINH, maThietLap);

}

function getDinhDangMaMacDinh(maThietLap) {
    return (
        DINH_DANG_MA_MAC_DINH[ maThietLap ] || null
    );

}

module.exports = {
    DINH_DANG_MA_MAC_DINH,
    laThietLapDinhDangMa,
    getDinhDangMaMacDinh
};