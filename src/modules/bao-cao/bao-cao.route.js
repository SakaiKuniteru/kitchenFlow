'use strict';
const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate.middleware');
const authorize = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');


const taiChinhController = require('./tai-chinh/tai-chinh.controller');
const { xemSchema: tc01XemSchema } = require('./tai-chinh/tc01/tc01.validation');
const { xemSchema: tc02XemSchema } = require('./tai-chinh/tc02/tc02.validation');
const { xemSchema: tc03XemSchema } = require('./tai-chinh/tc03/tc03.validation');
const { xemSchema: tc04XemSchema } = require('./tai-chinh/tc04/tc04.validation');
const { xemSchema: tc05XemSchema } = require('./tai-chinh/tc05/tc05.validation');


const veAnController = require('./ve-an/ve-an.controller');
const { xemSchema: va01XemSchema } = require('./ve-an/va01/va01.validation');
const { xemSchema: va02XemSchema } = require('./ve-an/va02/va02.validation');
const { xemSchema: va03XemSchema } = require('./ve-an/va03/va03.validation');
const { xemSchema: va04XemSchema } = require('./ve-an/va04/va04.validation');
const { xemSchema: va05XemSchema } = require('./ve-an/va05/va05.validation');


const datMonController = require('./dat-mon/dat-mon.controller');
const { xemSchema: dh01XemSchema } = require('./dat-mon/dh01/dh01.validation');
const { xemSchema: dh02XemSchema } = require('./dat-mon/dh02/dh02.validation');
const { xemSchema: dh03XemSchema } = require('./dat-mon/dh03/dh03.validation');
const { xemSchema: dh04XemSchema } = require('./dat-mon/dh04/dh04.validation');
const { xemSchema: dh05XemSchema } = require('./dat-mon/dh05/dh05.validation');
const { xemSchema: dh06XemSchema } = require('./dat-mon/dh06/dh06.validation');
const { xemSchema: dh07XemSchema } = require('./dat-mon/dh07/dh07.validation');


const thucDonController = require('./thuc-don/thuc-don.controller');
const { xemSchema: td01XemSchema } = require('./thuc-don/td01/td01.validation');
const { xemSchema: td02XemSchema } = require('./thuc-don/td02/td02.validation');
const { xemSchema: td03XemSchema } = require('./thuc-don/td03/td03.validation');
const { xemSchema: td04XemSchema } = require('./thuc-don/td04/td04.validation');
const { xemSchema: td05XemSchema } = require('./thuc-don/td05/td05.validation');
const { xemSchema: td06XemSchema } = require('./thuc-don/td06/td06.validation');

router.post(
    '/tai-chinh/tc01',
    authenticate,
    validate(tc01XemSchema),
    authorize('Q003001'),
    taiChinhController.tc01
);

router.post(
    '/tai-chinh/tc02',
    authenticate,
    validate(tc02XemSchema),
    authorize('Q003002'),
    taiChinhController.tc02
);

router.post(
    '/tai-chinh/tc03',
    authenticate,
    validate(tc03XemSchema),
    authorize('Q003003'),
    taiChinhController.tc03
);

router.post(
    '/tai-chinh/tc04',
    authenticate,
    validate(tc04XemSchema),
    authorize('Q003004'),
    taiChinhController.tc04
);

router.post(
    '/tai-chinh/tc05',
    authenticate,
    validate(tc05XemSchema),
    authorize('Q003005'),
    taiChinhController.tc05
);

router.post(
    '/ve-an/va01',
    authenticate,
    validate(va01XemSchema),
    authorize('Q003011'),
    veAnController.va01
);

router.post(
    '/ve-an/va02',
    authenticate,
    validate(va02XemSchema),
    authorize('Q003012'),
    veAnController.va02
);

router.post(
    '/ve-an/va03',
    authenticate,
    validate(va03XemSchema),
    authorize('Q003013'),
    veAnController.va03
);

router.post(
    '/ve-an/va04',
    authenticate,
    validate(va04XemSchema),
    authorize('Q003014'),
    veAnController.va04
);

router.post(
    '/ve-an/va05',
    authenticate,
    validate(va05XemSchema),
    authorize('Q003015'),
    veAnController.va05
);

router.post(
    '/don-hang/dh01',
    authenticate,
    validate(dh01XemSchema),
    authorize('Q003016'),
    datMonController.dh01
);

router.post(
    '/don-hang/dh02',
    authenticate,
    validate(dh02XemSchema),
    authorize('Q003017'),
    datMonController.dh02
);

router.post(
    '/don-hang/dh03',
    authenticate,
    validate(dh03XemSchema),
    authorize('Q003018'),
    datMonController.dh03
);

router.post(
    '/don-hang/dh04',
    authenticate,
    validate(dh04XemSchema),
    authorize('Q003019'),
    datMonController.dh04
);

router.post(
    '/don-hang/dh05',
    authenticate,
    validate(dh05XemSchema),
    authorize('Q003020'),
    datMonController.dh05
);

router.post(
    '/don-hang/dh06',
    authenticate,
    validate(dh06XemSchema),
    authorize('Q003022'),
    datMonController.dh06
);

router.post(
    '/don-hang/dh07',
    authenticate,
    validate(dh06XemSchema),
    authorize('Q003023'),
    datMonController.dh07
);


router.post(
    '/thuc-don/td01',
    authenticate,
    validate(td01XemSchema),
    authorize('Q003006'),
    thucDonController.td01
);

router.post(
    '/thuc-don/td02',
    authenticate,
    validate(td02XemSchema),
    authorize('Q003007'),
    thucDonController.td02
);

router.post(
    '/thuc-don/td03',
    authenticate,
    validate(td03XemSchema),
    authorize('Q003008'),
    thucDonController.td03
);

router.post(
    '/thuc-don/td04',
    authenticate,
    validate(td04XemSchema),
    authorize('Q003009'),
    thucDonController.td04
);

router.post(
    '/thuc-don/td05',
    authenticate,
    validate(td05XemSchema),
    authorize('Q003011'),
    thucDonController.td05
);

router.post(
    '/thuc-don/td06',
    authenticate,
    validate(td06XemSchema),
    authorize('Q003011'),
    thucDonController.td05
);

module.exports = router;