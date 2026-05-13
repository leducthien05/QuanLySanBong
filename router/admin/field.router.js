const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/field.controller");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/field.validate");
router.get("/", controller.index);
router.get("/create", controller.create);
router.post(
    "/create",
    upload.single("image"),
    uploadImage.uploadCloudinary,
    validate.create,
    controller.createPost);

module.exports = router