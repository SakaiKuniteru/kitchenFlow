const express = require("express");

const router = express.Router();

const { createSchema,updateSchema } = require("./chinh-sach.validation");

const validate = require("../../../../middlewares/validate.middleware");

const authenticate = require("../../../../middlewares/authenticate.middleware");

const controller = require("./chinh-sach.controller");

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/tong-hop/doi-tuong",
    authenticate,
    controller
        .getTongHopDoiTuong
);

router.get(
    "/tong-hop/voucher",
    authenticate,
    controller
        .getTongHopVoucher
);

router.get(
    "/tong-hop/loai-chinh-sach",
    authenticate,
    controller
        .getLoaiChinhSach
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

router.get(
    "/:id/doi-tuong",
    authenticate,
    controller
        .getDoiTuongTheoChinhSach
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