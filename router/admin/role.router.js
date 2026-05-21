const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/role.controller");
const permission = require("../../middleware/admin/permission.middleware");
const validate = require("../../validator/admin/role.validate");

router.get("/", permission.checkPermission("roles_view"), controller.index);
router.get("/create", permission.checkPermission("roles_create"), controller.create);
router.post(
    "/create",
    permission.checkPermission("roles_create"),
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", permission.checkPermission("roles_edit"), controller.changeStatus);
router.patch("/change-multi-status", permission.checkPermission("roles_edit"), controller.changeMultiStatus);
router.delete("/delete/:id", permission.checkPermission("roles_delete"), controller.deleteRole);
router.get("/edit/:id", permission.checkPermission("roles_edit"), controller.edit);
router.patch(
    "/edit/:id",
    permission.checkPermission("roles_edit"),
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", permission.checkPermission("roles_view"), controller.detail);
router.get("/permission", permission.checkPermission("permission"), controller.permission);
router.patch("/permission", permission.checkPermission("permission"), controller.permissionPatch);

module.exports = router;
