const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/account.controller");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/account.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post(
    "/create",
    upload.single("avatar"),
    uploadImage.uploadCloudinary,
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi-status", controller.changeMultiStatus);
router.delete("/delete/:id", controller.deleteAccount);
router.get("/edit/:id", controller.edit);
router.patch(
    "/edit/:id",
    upload.single("avatar"),
    uploadImage.uploadCloudinary,
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", controller.detail);

module.exports = router;
