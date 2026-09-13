'use strict';

const express = require(
    'express'
);


const router =
    express.Router();


const authenticate = require(
    '../../middlewares/authenticate.middleware'
);


const authorize = require(
    '../../middlewares/authorize.middleware'
);


const validate = require(
    '../../middlewares/validate.middleware'
);


const taiChinhController = require(
    './tai-chinh/tai-chinh.controller'
);


const {
    xemSchema: tc01XemSchema
} = require(
    './tai-chinh/tc01/tc01.validation'
);

const {
    xemSchema: tc02XemSchema
} = require('./tai-chinh/tc02/tc02.validation');

const {
    xemSchema: tc03XemSchema
} = require('./tai-chinh/tc03/tc03.validation');

router.post(
    '/tai-chinh/tc01',

    authenticate,

    validate(
        tc01XemSchema
    ),

    taiChinhController
        .tc01
);

router.post(
    '/tai-chinh/tc02',
    authenticate,
    validate(tc02XemSchema),
    taiChinhController.tc02
);

router.post(
    '/tai-chinh/tc03',
    authenticate,
    validate(tc03XemSchema),
    taiChinhController.tc03
);

module.exports =
    router;