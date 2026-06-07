const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();
const controller = require("../../controller/admin/setting.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");

// [GET] /admin/settings
router.get("/", permission.checkPermission("settings"), controller.index);

// [PATCH] /admin/settings/edit
router.patch(
    "/edit",
    upload.fields(
        [
            { name: "logo", maxCount: 1 },
            { name: "favicon", maxCount: 1 },
            { name: "avatarUser", maxCount: 5 }
        ]
    ),
    permission.checkPermission("settings"),
    uploadImage.uploadMulti,
    controller.editPatch
);

module.exports = router;
