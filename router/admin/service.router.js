const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/service.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/service.validate");

router.get("/", permission.checkPermission("services_view"), controller.index);
router.get("/create", permission.checkPermission("services_create"), controller.create);
router.post(
    "/create",
    permission.checkPermission("services_create"),
    upload.single("image"),
    uploadImage.uploadCloudinary,
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", permission.checkPermission("services_edit"), controller.changeStatus);
router.patch("/change-multi-status", permission.checkPermission("services_edit"), controller.changeMultiStatus);
router.delete("/delete/:id", permission.checkPermission("services_delete"), controller.deleteService);
router.get("/edit/:id", permission.checkPermission("services_edit"), controller.edit);
router.patch(
    "/edit/:id",
    permission.checkPermission("services_edit"),
    upload.single("image"),
    uploadImage.uploadCloudinary,
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", permission.checkPermission("services_view"), controller.detail);

module.exports = router;