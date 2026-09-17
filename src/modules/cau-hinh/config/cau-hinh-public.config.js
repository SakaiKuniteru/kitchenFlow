'use strict';

const { MA_THIET_LAP } = require('../cau-hinh.constants');

const PUBLIC_SETTINGS = new Set([
    MA_THIET_LAP.TEN_HE_THONG,
    MA_THIET_LAP.LOGO_CO_SO_MAC_DINH
]);

module.exports = {
    PUBLIC_SETTINGS
};