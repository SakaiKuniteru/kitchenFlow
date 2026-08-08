const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./phong-ban.validation");

const validate = require("../../../../middlewares/validate.middleware");

const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./phong-ban.controller");

const uploadImportExcel = require( "../../../../middlewares/upload-import-excel.middleware" );

const phongBanExcel = require( "./phong-ban.excel" );

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/xuat-du-lieu",
    authenticate,
    phongBanExcel.exportData
);


router.post(
    "/import-du-lieu",
    authenticate,
    uploadImportExcel.single(
        "file"
    ),
    phongBanExcel.importData
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    validate(updateSchema),
    controller.update
);

module.exports = router;