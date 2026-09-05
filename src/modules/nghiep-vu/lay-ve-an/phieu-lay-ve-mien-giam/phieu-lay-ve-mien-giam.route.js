const express =

    require(

        "express"

    );


const router =

    express.Router();


const {

    apDungSchema,

    createSchema,

    updateSchema

} = require(

    "./phieu-lay-ve-mien-giam.validation"

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

        "./phieu-lay-ve-mien-giam.controller"

    );


router.get(

    "/tong-hop",

    authenticate,

    authorize(

        "Q_QUYEN_XEM_MODULE"

    ),

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    controller.getTongHop

);


router.get(

    "/kha-dung",

    authenticate,

    authorize(

        "Q_QUYEN_XEM",

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    controller.getKhaDung

);


router.post(

    "/ap-dung",

    authenticate,

    authorize(

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    validate(

        apDungSchema

    ),

    controller.apDung

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


router.delete(

    "/xoa/:id",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    controller.delete

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


module.exports =

    router;