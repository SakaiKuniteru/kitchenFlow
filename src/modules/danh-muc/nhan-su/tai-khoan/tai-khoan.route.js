const express = require("express");
const router = express.Router();
const {
    createSchema,
    updateSchema,
    doiMatKhauSchema,
    datLaiMatKhauSchema
} = require("./tai-khoan.validation");
const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const controller = require("./tai-khoan.controller");
const uploadNhanVien = require("../nhan-vien/upload-nhan-vien.middleware");
const uploadImportExcel = require("../../../../middlewares/upload-import-excel.middleware");
const chucVuExcel = require("./tai-khoan.excel");
const validateUpdateTaiKhoan = validate(updateSchema);

function validateTaiKhoanUpdate(
    req,
    res,
    next
) {

    const hasBody =
        Object.keys(
            req.body || {}
        ).length > 0;

    const hasFile =
        Boolean(
            req.file
        );

    if (
        !hasBody &&
        hasFile
    ) {
        return next();
    }
    return validateUpdateTaiKhoan(
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
    uploadNhanVien.single(
        "anhDaiDien"
    ),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    uploadNhanVien.single(
        "anhDaiDien"
    ),
    validateTaiKhoanUpdate,
    controller.update
);

router.patch(
    "/doi-mat-khau",
    authenticate,
    validate(doiMatKhauSchema),
    controller.doiMatKhau
);

router.patch(
    "/dat-lai-mat-khau/:id",
    authenticate,
    validate(datLaiMatKhauSchema),
    controller.datLaiMatKhau
);

module.exports = router;