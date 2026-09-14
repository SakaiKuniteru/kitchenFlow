'use strict';
const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const taiChinhController = require('./tai-chinh/tai-chinh.controller');
const datMonController = require('./dat-mon/dat-mon.controller');
const veAnController = require('./ve-an/ve-an.controller');

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

const {
    xemSchema: tc04XemSchema
} = require('./tai-chinh/tc04/tc04.validation');

const {
    xemSchema: tc05XemSchema
} = require('./tai-chinh/tc05/tc05.validation');

const {
    xemSchema: va01XemSchema
} = require('./ve-an/va01/va01.validation');

const {
    xemSchema: va02XemSchema
} = require('./ve-an/va02/va02.validation');

const {
    xemSchema: va03XemSchema
} = require('./ve-an/va03/va03.validation');

const {
    xemSchema: va04XemSchema
} = require('./ve-an/va04/va04.validation');

const {
    xemSchema: va05XemSchema
} = require('./ve-an/va05/va05.validation');


const {
    xemSchema: dh01XemSchema
} = require('./dat-mon/dh01/dh01.validation');

const {
    xemSchema: dh02XemSchema
} = require('./dat-mon/dh02/dh02.validation');

const {
    xemSchema: dh03XemSchema
} = require('./dat-mon/dh03/dh03.validation');

const {
    xemSchema: dh04XemSchema
} = require('./dat-mon/dh04/dh04.validation');

const {
    xemSchema: dh05XemSchema
} = require('./dat-mon/dh05/dh05.validation');


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

router.post(
    '/tai-chinh/tc04',
    authenticate,
    validate(tc04XemSchema),
    taiChinhController.tc04
);

router.post(
    '/tai-chinh/tc05',
    authenticate,
    validate(tc05XemSchema),
    taiChinhController.tc05
);

router.post(
    '/ve-an/va01',
    authenticate,
    validate(va01XemSchema),
    veAnController.va01
);

router.post(
    '/ve-an/va02',
    authenticate,
    validate(va02XemSchema),
    veAnController.va02
);

router.post(
    '/ve-an/va03',
    authenticate,
    validate(va03XemSchema),
    veAnController.va03
);

router.post(
    '/ve-an/va04',
    authenticate,
    validate(va04XemSchema),
    veAnController.va04
);

router.post(
    '/ve-an/va05',
    authenticate,
    validate(va05XemSchema),
    veAnController.va05
);

router.post(
    '/don-hang/dh01',
    authenticate,
    validate(va01XemSchema),
    datMonController.dh01
);

router.post(
    '/don-hang/dh02',
    authenticate,
    validate(va02XemSchema),
    datMonController.dh02
);

router.post(
    '/don-hang/dh03',
    authenticate,
    validate(va03XemSchema),
    datMonController.dh03
);

router.post(
    '/don-hang/dh04',
    authenticate,
    validate(va04XemSchema),
    datMonController.dh04
);

router.post(
    '/don-hang/dh05',
    authenticate,
    validate(va05XemSchema),
    datMonController.dh05
);
module.exports =
    router;