const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/dashboard.controller");
const permission = require("../../middleware/admin/permission.middleware");
router.get("/", permission.checkPermission("reports_revenue"), controller.dashboard);

module.exports = router