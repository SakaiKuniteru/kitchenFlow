const express = require("express");

const router = express.Router();

const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./dia-chi.controller");

const chucVuExcel = require( "./dia-chi.excel" );

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

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

module.exports =
    router;