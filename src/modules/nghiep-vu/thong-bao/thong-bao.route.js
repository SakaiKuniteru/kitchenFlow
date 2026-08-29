const express = require("express");

const router = express.Router();

const {
    createSchema,
    updateSchema
} = require("./thong-bao.validation");

const validate =
    require("../../../middlewares/validate.middleware");

const authenticate =
    require("../../../middlewares/authenticate.middleware");

const controller =
    require("./thong-bao.controller");


router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/tong-hop/doi-tuong",
    authenticate,
    controller.getTongHopDoiTuong
);

router.get(
    "/cua-toi",
    authenticate,
    controller.getCuaToi
);

router.get(
    "/cua-toi/so-chua-doc",
    authenticate,
    controller.getSoChuaDoc
);

router.patch(
    "/cua-toi/da-doc-tat-ca",
    authenticate,
    controller.danhDauTatCaDaDoc
);

router.patch(
    "/cua-toi/:id/da-doc",
    authenticate,
    controller.danhDauDaDoc
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
    "/gui/:id",
    authenticate,
    controller.gui
);

router.patch(
    "/huy-gui/:id",
    authenticate,
    controller.huyGui
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

module.exports = router;