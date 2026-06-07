const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const controller = require("../../controller/client/auth.controller");
const validate = require("../../validator/client/auth.validate");
const middlewareUpload = require("../../middleware/admin/uploadImage.middleware");

router.get("/", controller.auth);
router.post(
    "/register", 
    upload.single("avatarUser"),
    middlewareUpload.uploadSingle,
    validate.register,
    controller.register
);
router.post("/login", validate.login, controller.login);
router.get("/logout", controller.logout);
router.get("/forgot-password", controller.forgotPassword);
router.post("/forgot-password", controller.forgotPasswordPost);
router.get("/forgot-password/otp", controller.getOtp);
router.post("/forgot-password/otp", controller.getOtpPost);
router.get("/reset-password", controller.resetPassword);
router.post("/reset-password", validate.resetPassword, controller.resetPasswordPost);
module.exports = router;
