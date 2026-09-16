'use strict';

const express = require('express');
const authenticate = require('../../../../middlewares/authenticate.middleware');
const authorize = require('../../../../middlewares/authorize.middleware');
const validate = require('../../../../middlewares/validate.middleware');
const controller = require('./don-hang.controller');
const report = require('../bao-cao/don-hang.export');
const { createSchema, actionSchema } = require('./don-hang.validation');
const router =express.Router();
router.use(authenticate);

router.post(
    '/tao-moi',
    authorize('Q002021'),
    validate(createSchema),
    controller.create
);

router.get(
    '/cua-toi',
    authorize('Q002021'),
    controller.listMine
);

router.get(
    '/quan-ly',
    authorize('Q002041'),
    controller.listManagement
);

router.get(
    '/quan-ly/xuat-du-lieu',
    authorize('Q002041'),
    report.exportExcel
);

router.get(
    '/quan-ly/:id',
    authorize('Q002041'),
    controller.managementDetail
);

router.patch(
    '/quan-ly/:id/huy',
    authorize('Q002042'),
    validate(actionSchema),
    controller.huyNhaAn
);

router.get(
    '/:id',
    authorize('Q002021'),
    controller.detail
);

router.patch(
    '/:id/huy',
    authorize('Q002021'),
    validate(actionSchema),
    controller.huy
);

router.patch(
    '/:id/xac-nhan',
    authorize('Q002042'),
    validate(actionSchema),
    controller.xacNhan
);

router.patch(
    '/:id/tu-choi',
    authorize('Q002042'),
    validate(actionSchema),
    controller.tuChoi
);

router.patch(
    '/:id/san-sang-giao',
    authorize('Q002042'),
    validate(actionSchema),
    controller.sanSangGiao
);

router.patch(
    '/:id/bat-dau-giao',
    authorize('Q002042'),
    validate(actionSchema),
    controller.batDauGiao
);

router.patch(
    '/:id/hoan-thanh',
    authorize('Q002042'),
    validate(actionSchema),
    controller.hoanThanh
);

module.exports = router;