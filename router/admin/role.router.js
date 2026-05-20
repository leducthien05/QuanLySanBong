const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/role.controller");
const validate = require("../../validator/admin/role.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.post(
    "/create",
    validate.create,
    controller.createPost
);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi-status", controller.changeMultiStatus);
router.delete("/delete/:id", controller.deleteRole);
router.get("/edit/:id", controller.edit);
router.patch(
    "/edit/:id",
    validate.create,
    controller.editPatch
);
router.get("/detail/:id", controller.detail);
router.get("/permission", controller.permission);
router.patch("/permission", controller.permissionPatch);

module.exports = router;
