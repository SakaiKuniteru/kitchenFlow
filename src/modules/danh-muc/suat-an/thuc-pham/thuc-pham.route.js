const express = require("express");
const router = express.Router();
const { createSchema, updateSchema } = require("./thuc-pham.validation");
const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const controller = require("./thuc-pham.controller");
const multer = require("multer");
const excelController = require("./thuc-pham.excel");

const uploadExcel = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const uploadThucPham = require("./upload-thuc-pham.middleware");

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
    uploadExcel.single("file"),
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
    uploadThucPham.single("hinhAnh"),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    uploadThucPham.single("hinhAnh"),
    validate(updateSchema),
    controller.update
);

module.exports = router;