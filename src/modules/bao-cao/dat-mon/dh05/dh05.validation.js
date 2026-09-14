'use strict';

const {
    Joi,
    taoSchema,
    trangThaiSchema,
    idArraySchema
} = require('../dat-mon-report.helper');

const DS_DANH_GIA = [
    'DUNG_HAN',
    'TRE_HAN',
    'DANG_TRE',
    'CHUA_QUA_HAN',
    'KHONG_DANH_GIA',
    'THIEU_DU_LIEU'
];

const xemSchema = taoSchema({
    trangThaiDon: trangThaiSchema(),

    nguoiXuLyIds: idArraySchema(),

    danhGia: Joi.array()
        .items(Joi.string().valid(...DS_DANH_GIA))
        .single()
        .unique()
        .default([])
});

module.exports = {
    xemSchema,
    DS_DANH_GIA
};