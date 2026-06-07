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
module.exports = router;
