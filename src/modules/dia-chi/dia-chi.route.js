const express = require("express");

const router = express.Router();

const authenticate = require("../../middlewares/authenticate.middleware");

const controller = require("./dia-chi.controller");

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

module.exports =
    router;