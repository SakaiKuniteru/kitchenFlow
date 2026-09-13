'use strict';

const {
    xemSchema: tc01XemSchema,
    LOAI_THOI_GIAN_TC01
} = require('../tc01/tc01.validation');

const LOAI_THOI_GIAN_TC02 = [...LOAI_THOI_GIAN_TC01];

const xemSchema = tc01XemSchema.clone();

module.exports = {
    xemSchema,
    LOAI_THOI_GIAN_TC02
};