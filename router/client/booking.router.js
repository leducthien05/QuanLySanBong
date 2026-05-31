const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/booking.controller");

router.get("/", controller.index);
router.get("/filter", controller.filter);
router.get("/field/:id", controller.getField);
router.post("/payment", controller.payment);
router.get("/payment-vnpay", controller.vnpay);
router.get("/payment-momo/return", controller.return);
router.post("/payment-momo/notify", controller.notify);

module.exports = router;
