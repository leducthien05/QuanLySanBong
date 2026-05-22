const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/myaccount.controller");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/account.validate");

router.get("/", controller.detail);
router.patch(
    "/edit/:id",
    upload.single("avatar"),
    uploadImage.uploadSingle,
    controller.editPatch
);

module.exports = router;
