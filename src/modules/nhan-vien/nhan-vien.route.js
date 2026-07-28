const express = require("express");

const router = express.Router();

const controller = require("./nhan-vien.controller");

const authenticate = require("../../middlewares/authenticate.middleware");
const authorize = require("../../middlewares/authorize.middleware");

const validate = require("../../middlewares/validate.middleware");

const { createSchema, updateSchema } = require("./nhan-vien.validation");

router.get(

    "/tong-hop",

    authenticate,

    authorize(
        "SUPER_ADMIN"
    ),

    controller.getTongHop

);

router.get(

    "/:id",

    authenticate,

    authorize(
        "SUPER_ADMIN"
    ),

    controller.getChiTiet

);

router.post(

    "/them-moi",

    authenticate,

    authorize(
        "SUPER_ADMIN"
    ),

    validate(createSchema),

    controller.create

);

router.patch(

    "/cap-nhat/:id",

    authenticate,

    authorize(
        "SUPER_ADMIN"
    ),

    validate(updateSchema),

    controller.update

);

module.exports = router;