const express =

    require(

        "express"

    );


const router =

    express.Router();


const {

    createSchema,

    updateSchema,

    huySchema

} = require(

    "./phieu-lay-ve-an.validation"

);


const validate =

    require(

        "../../../../middlewares/validate.middleware"

    );


const authenticate =

    require(

        "../../../../middlewares/authenticate.middleware"

    );


const authorize =

    require(

        "../../../../middlewares/authorize.middleware"

    );


const controller =

    require(

        "./phieu-lay-ve-an.controller"

    );


router.get(

    "/tong-hop",

    authenticate,

    authorize(

        "Q_QUYEN_XEM_MODULE"

    ),

    controller.getTongHop

);


router.get(

    "/thuc-don-ngay-hop-le",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    controller.getThucDonNgayHopLe

);


router.get(

    "/in-ve/:id",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_IN"

    ),

    controller.inVe

);


router.get(

    "/:id",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    controller.getChiTiet

);


router.post(

    "/them-moi",

    authenticate,

    authorize(

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    validate(

        createSchema

    ),

    controller.create

);


router.patch(

    "/cap-nhat/:id",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        updateSchema

    ),

    controller.update

);


router.patch(

    "/huy/:id",

    authenticate,

    authorize(

        "Q_QUYEN_HUY"

    ),

    validate(

        huySchema

    ),

    controller.huy

);


module.exports =

    router;