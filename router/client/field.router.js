const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/field.controller");

router.get("/", controller.index);
router.get("/search", controller.search);
// router.get("/field/:id", controller.getField);
// router.post("/payment", controller.payment);
// router.get("/payment-vnpay", controller.vnpay);
// router.get("/payment-momo/return", controller.return);
// router.post("/payment-momo/notify", controller.notify);

module.exports = router;
