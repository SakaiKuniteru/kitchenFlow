const express =

    require(

        "express"

    );


const router =

    express.Router();


const {

    kiemTraSchema,

    xacNhanSuDungSchema,

    huySchema

} = require(

    "./ve-an.validation"

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

        "./ve-an.controller"

    );


router.get(

    "/tong-hop",

    authenticate,

    authorize(

        "Q_QUYEN_XEM_MODULE"

    ),

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_SUA"

    ),

    controller.getTongHop

);


router.post(

    "/kiem-tra",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_SUA"

    ),

    validate(

        kiemTraSchema

    ),

    controller.kiemTra

);


router.post(

    "/xac-nhan-su-dung",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        xacNhanSuDungSchema

    ),

    controller.xacNhanSuDung

);


router.patch(

    "/huy/:id",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        huySchema

    ),

    controller.huy

);


router.get(

    "/:id",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_SUA"

    ),

    controller.getChiTiet

);


module.exports =

    router;