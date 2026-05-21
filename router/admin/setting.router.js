const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/setting.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");

// [GET] /admin/settings
router.get("/", permission.checkPermission("settings"), controller.index);

// [PATCH] /admin/settings/edit
router.patch(
    "/edit",
    permission.checkPermission("settings"),
    uploadImage.uploadCloudinary,
    controller.editPatch
);

module.exports = router;
