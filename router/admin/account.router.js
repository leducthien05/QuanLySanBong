const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/account.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/account.validate");

router.get("/", permission.checkPermission("accounts_view"), controller.index);
router.get("/create", permission.checkPermission("accounts_create"), controller.create);
router.post(
    "/create",
    permission.checkPermission("accounts_create"),
    upload.single("avatar"),
    uploadImage.uploadSingle,
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id",  permission.checkPermission("accounts_edit"), controller.changeStatus);
router.patch("/change-multi-status", permission.checkPermission("accounts_edit"), controller.changeMultiStatus);
router.delete("/delete/:id", permission.checkPermission("accounts_delete"), controller.deleteAccount);
router.get("/edit/:id", permission.checkPermission("accounts_edit"), controller.edit);
router.patch(
    "/edit/:id",
    permission.checkPermission("accounts_edit"),
    upload.single("avatar"),
    uploadImage.uploadSingle,
    controller.editPatch
);
router.get("/detail/:id", permission.checkPermission("accounts_view"), controller.detail);

module.exports = router;
