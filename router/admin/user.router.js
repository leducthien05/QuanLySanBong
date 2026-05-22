const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/user.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/user.validate");

router.get("/", permission.checkPermission("users_view"), controller.index);
router.get("/create", permission.checkPermission("users_create"), controller.create);
router.post(
    "/create",
    permission.checkPermission("users_create"),
    upload.single("avatar"),
    uploadImage.uploadSingle,
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", permission.checkPermission("users_edit"), controller.changeStatus);
router.patch("/change-multi-status", permission.checkPermission("users_edit"), controller.changeMultiStatus);
router.delete("/delete/:id", permission.checkPermission("users_delete"), controller.deleteUser);
router.get("/edit/:id", permission.checkPermission("users_edit"), controller.edit);
router.patch(
    "/edit/:id",
    permission.checkPermission("users_edit"),
    upload.single("avatar"),
    uploadImage.uploadSingle,
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", permission.checkPermission("users_view"), controller.detail);

module.exports = router;
