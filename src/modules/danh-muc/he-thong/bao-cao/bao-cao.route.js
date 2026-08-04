const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./bao-cao.validation");

const validate = require("../../../../middlewares/validate.middleware");

const authenticate = require("../../../../middlewares/authenticate.middleware");

const uploadBaoCao = require("../../../../middlewares/upload-bao-cao.middleware");

const controller = require("./bao-cao.controller");

router.get(
    "/tong-hop",
    authenticate,
    controller.getTongHop
);

router.get(
    "/thong-tin-xuat/:idHoacMa",
    authenticate,
    controller.getThongTinXuatBaoCao
);

router.get(
    "/xuat/:idHoacMa",
    authenticate,
    controller.xuatBaoCao
);

router.get(
    "/:id",
    authenticate,
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    uploadBaoCao.single(
        "fileMau"
    ),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    uploadBaoCao.single(
        "fileMau"
    ),
    validate(updateSchema),
    controller.update
);

module.exports =
    router;