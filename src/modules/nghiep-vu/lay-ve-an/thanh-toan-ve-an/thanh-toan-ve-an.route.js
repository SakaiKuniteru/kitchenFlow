const express =

    require(

        "express"

    );


const router =

    express.Router();


const {

    createSchema,

    taoQrSchema,

    huyQrSchema,

    xacNhanSchema,

    hoanTienSchema,

    callbackSchema

} = require(

    "./thanh-toan-ve-an.validation"

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

        "./thanh-toan-ve-an.controller"

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


router.post(

    "/tao-qr",

    authenticate,

    authorize(

        "Q_QUYEN_THEM",

        "Q_QUYEN_SUA"

    ),

    validate(

        taoQrSchema

    ),

    controller.taoQr

);


router.patch(

    "/huy-qr/:id",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        huyQrSchema

    ),

    controller.huyQr

);


router.patch(

    "/xac-nhan/:id",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        xacNhanSchema

    ),

    controller.xacNhan

);


router.post(

    "/hoan-tien",

    authenticate,

    authorize(

        "Q_QUYEN_SUA"

    ),

    validate(

        hoanTienSchema

    ),

    controller.hoanTien

);


/*
 * Callback sau này phải xác thực riêng
 * bằng chữ ký / secret của cổng thanh toán.
 *
 * Không dùng authenticate JWT người dùng
 * nếu đây là callback từ hệ thống ngoài.
 */
router.post(

    "/callback",

    validate(

        callbackSchema

    ),

    controller.callback

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