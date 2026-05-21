const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/booking.controller");
const permission = require("../../middleware/admin/permission.middleware");

router.get("/", permission.checkPermission("bookings_view"), controller.index);
router.get("/detail/:id", permission.checkPermission("bookings_view"), controller.detail);
router.delete("/delete/:id", permission.checkPermission("bookings_delete"), controller.deleteBooking);

module.exports = router;
