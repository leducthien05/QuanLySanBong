const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/booking.controller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.delete("/delete/:id", controller.deleteBooking);

module.exports = router;
