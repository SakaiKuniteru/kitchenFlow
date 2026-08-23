const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./mon-an.validation");

const validate = require("../../../../middlewares/validate.middleware");

const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./mon-an.controller");

const uploadMonAn = require("./upload-mon-an.middleware");

const validateUpdateMonAn = validate(updateSchema);

const multer = require("multer");

const excelController = require("./mon-an.excel");

function parseDsThucPham(
    req,
    res,
    next
) {
    try {
        if (
            typeof req.body?.dsThucPham ===
            "string"
        ) {
            req.body.dsThucPham = JSON.parse(
                req.body.dsThucPham
            );
        }

        return next();
    } catch (error) {
        return next(
            new Error(
                "Danh sách thực phẩm không hợp lệ."
            )
        );
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

function validateMonAnUpdate(
    req,
    res,
    next
) {
    const hasBody = Object.keys(
        req.body || {}
    ).length > 0;

    const hasFile = Boolean(
        req.file
    );

    if (
        !hasBody &&
        hasFile
    ) {
        return next();
    }

    return validateUpdateMonAn(
        req,
        res,
        next
    );
}

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
    upload.single("file"),
    excelController.importData
);

router.get(
    "/xuat-cong-thuc",
    authenticate,
    excelController.exportCongThuc
);

router.post(
    "/import-cong-thuc",
    authenticate,
    upload.single("file"),
    excelController.importCongThuc
);

router.post(
    "/cap-nhat-gia",
    authenticate,
    controller.capNhatGia
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    uploadMonAn.single("hinhAnh"),
    parseDsThucPham,
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    uploadMonAn.single("hinhAnh"),
    parseDsThucPham,
    validateMonAnUpdate,
    controller.update
);

module.exports = router;