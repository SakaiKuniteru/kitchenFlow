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

const uploadImportExcel = require( "../../../../middlewares/upload-import-excel.middleware" );

const chucVuExcel = require( "./tai-khoan.excel" );


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