const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const controller = require("../../controller/admin/field.controller");
const permission = require("../../middleware/admin/permission.middleware");
const uploadImage = require("../../middleware/admin/uploadImage.middleware");
const validate = require("../../validator/admin/field.validate");

router.get("/", permission.checkPermission("fields_view"), controller.index);
router.get("/create", permission.checkPermission("fields_create"), controller.create);
router.post(
    "/create",
    permission.checkPermission("fields_create"),
    upload.fields(
        [
            { name: "image", maxCount: 8 }
        ]
    ),
    uploadImage.uploadMulti,
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", permission.checkPermission("fields_edit"), controller.changeStatus);
router.patch("/change-multi-status", permission.checkPermission("fields_edit"), controller.changeMultiStatus);
router.delete("/delete/:id", permission.checkPermission("fields_delete"), controller.deleteField);
router.get("/edit/:id", permission.checkPermission("fields_edit"), controller.edit);
router.patch(
    "/edit/:id",
    permission.checkPermission("fields_edit"),
    upload.fields(
        [
            { name: "image", maxCount: 8 }
        ]
    ),
    uploadImage.uploadMulti,
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", permission.checkPermission("fields_view"), controller.detail);

module.exports = router;