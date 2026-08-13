const express = require( "express" );

const router = express.Router();


const {
    createSchema,
    updateSchema
} = require( "./thuc-don.validation" );


const validate = require( "../../../middlewares/validate.middleware" );

const authenticate = require( "../../../middlewares/authenticate.middleware" );

const uploadImportExcel = require( "../../../middlewares/upload-import-excel.middleware" );

const controller = require( "./thuc-don.controller" );

const thucDonExcel = require( "./thuc-don.excel" );

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/xuat-du-lieu",
    authenticate,
    thucDonExcel.exportData
);

router.post(
    "/import-du-lieu",
    authenticate,
    uploadImportExcel.single(
        "file"
    ),
    thucDonExcel.importData
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    validate(
        createSchema
    ),
    controller.create
);


router.patch(
    "/cap-nhat/:id",
    authenticate,
    validate(
        updateSchema
    ),
    controller.update
);

router.delete(
    "/xoa/:id",
    authenticate,
    controller.xoa
);

router.patch(
    "/duyet/:id",
    authenticate,
    controller.duyet
);

router.patch(
    "/huy-duyet/:id",
    authenticate,
    controller.huyDuyet
);

router.patch(
    "/huy/:id",
    authenticate,
    controller.huy
);

router.patch(
    "/hoan-huy/:id",
    authenticate,
    controller.hoanHuy
);

module.exports =
    router;