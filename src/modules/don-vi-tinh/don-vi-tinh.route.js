const express = require("express");

const router = express.Router();

const { createSchema,updateSchema } = require("./don-vi-tinh.validation");

const validate = require("../../middlewares/validate.middleware");

const authenticate = require("../../middlewares/authenticate.middleware");
const uploadImportExcel = require("../../middlewares/upload-import-excel.middleware");

const controller = require("./don-vi-tinh.controller");

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/xuat-du-lieu",
    authenticate,
    controller.exportData
);

router.post(
    "/import-du-lieu",
    authenticate,
    uploadImportExcel.single(
        "fileImport"
    ),
    controller.importData
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