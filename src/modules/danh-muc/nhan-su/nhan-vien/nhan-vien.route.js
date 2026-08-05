const express = require("express");

const router = express.Router();

const controller = require("./nhan-vien.controller");

const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");

const validate = require("../../../../middlewares/validate.middleware");

const uploadNhanVien = require( "./upload-nhan-vien.middleware" );

const { createSchema, updateSchema } = require("./nhan-vien.validation");

router.get(

    "/tong-hop",

    authenticate,

    controller.getTongHop

);

router.get(

    "/:id",

    authenticate,

    controller.getChiTiet

);

router.post(

    "/them-moi",

    authenticate,

    uploadNhanVien.single( "anhDaiDien" ),

    validate(createSchema),

    controller.create

);

router.patch(

    "/cap-nhat/:id",

    authenticate,

    uploadNhanVien.single( "anhDaiDien" ),

    validate(updateSchema),

    controller.update

);

module.exports = router;