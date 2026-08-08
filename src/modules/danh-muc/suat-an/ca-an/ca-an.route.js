const express = require("express");

const router = express.Router();

const { createSchema,updateSchema } = require("./ca-an.validation");

const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./ca-an.controller");

const multer = require("multer");

const excelController = require( "./ca-an.excel" );

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