const express = require("express");

const router = express.Router();

const { createSchema,updateSchema } = require("./don-vi-tinh.validation");

const validate = require("../../../../middlewares/validate.middleware");

const authenticate = require("../../../../middlewares/authenticate.middleware");
const uploadImportExcel = require("../../../../middlewares/upload-import-excel.middleware");

const controller = require("./don-vi-tinh.controller");

const multer = require("multer");

const excelController = require( "./don-vi-tinh.excel" );

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                10 * 1024 * 1024

        }

    });

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/xuat-du-lieu",
    authenticate,
    excelController.exportData
);


router.post(
    "/import-du-lieu",
    authenticate,
    upload.single(
        "file"
    ),
    excelController.importData
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