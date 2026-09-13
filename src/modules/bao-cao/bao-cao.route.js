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

const QUYEN_TC01 =
    'Qxxxxxx';


router.post(
    '/tai-chinh/tc01',

    authenticate,

    validate(
        tc01XemSchema
    ),

    taiChinhController
        .tc01
);


module.exports =
    router;