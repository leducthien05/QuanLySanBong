const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/booking.controller");

router.get("/", controller.index);
router.get("/filter", controller.filter);
router.get("/field/:id", controller.getField);

module.exports = router;
