const express = require("express");

const router = express.Router();

const controller = require("./xac-thuc.controller");

const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const validate = require("../../../../middlewares/validate.middleware");

const { loginSchema, refreshTokenSchema, logoutSchema, profileSchema, changeMatKhauSchema } = require("./xac-thuc.validation");

router.post(
    "/login",
    validate(loginSchema),
    controller.login
);

router.post(
    "/lam-moi-token",
    validate(refreshTokenSchema),
    controller.refreshToken
);

router.post(
    "/logout",
    // validate(logoutSchema),
    controller.logout
);

router.post(

    "/doi-mat-khau",
    validate(changeMatKhauSchema),
    authenticate,
    controller.changeMatKhau

);

module.exports = router;