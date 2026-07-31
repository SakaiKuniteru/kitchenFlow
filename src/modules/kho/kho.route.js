const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./kho.validation");

const validate = require("../../middlewares/validate.middleware");
const authenticate = require("../../middlewares/authenticate.middleware");

const controller = require("./kho.controller");

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