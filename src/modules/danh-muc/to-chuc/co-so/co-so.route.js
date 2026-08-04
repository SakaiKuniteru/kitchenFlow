const express = require("express");

const router = express.Router();

const { createSchema, updateSchema } = require("./co-so.validation");

const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const uploadCoSo = require( "./upload-co-so.middleware" );
const mapCoSoUpload = require( "./map-co-so-upload.middleware" );

const controller = require("./co-so.controller");

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

    uploadCoSo.fields([
        {
            name:
                "logo",

            maxCount:
                1
        },
        {
            name:
                "favicon",

            maxCount:
                1
        },
        {
            name:
                "logoDoiTac",

            maxCount:
                1
        }
    ]),

    mapCoSoUpload,

    validate(createSchema),

    controller.create
);

router.patch(
    "/cap-nhat/:id",

    authenticate,

    uploadCoSo.fields([
        {
            name:
                "logo",

            maxCount:
                1
        },
        {
            name:
                "favicon",

            maxCount:
                1
        },
        {
            name:
                "logoDoiTac",

            maxCount:
                1
        }
    ]),

    mapCoSoUpload,

    validate(updateSchema),

    controller.update
);

module.exports = router;