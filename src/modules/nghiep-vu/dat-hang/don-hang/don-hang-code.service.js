'use strict';

const crypto = require('crypto');
const { formatDateTimeVietNam } = require('../../../../utils/date-time.util');

function generateOrderCode(now = new Date()) {
    const date = formatDateTimeVietNam(now).slice(0, 10).replaceAll('-', '');
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `DH${date}${suffix}`;
}

module.exports = { generateOrderCode };
