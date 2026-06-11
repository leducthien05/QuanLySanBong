const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/notification.controller");
const permission = require("../../middleware/admin/permission.middleware");
router.patch("/read-all", permission.checkPermission("booking_view"), controller.readAll);

module.exports = router