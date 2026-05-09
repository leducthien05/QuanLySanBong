const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/field.controller");
router.get("/", controller.index);

module.exports = router