const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./xa-phuong.validation");

const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./xa-phuong.controller");

const uploadImportExcel = require( "../../../../middlewares/upload-import-excel.middleware" );

const chucVuExcel = require( "./xa-phuong.excel" );

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/xuat-du-lieu",
    authenticate,
    chucVuExcel.exportData
);

router.post(
    "/import-du-lieu",
    authenticate,
    uploadImportExcel.single(
        "file"
    ),
    chucVuExcel.importData
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