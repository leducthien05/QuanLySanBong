const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/field.controller");

router.get("/", controller.index);
router.get("/search", controller.search);
router.get("/detail/:slug", controller.detail);
router.get("/pricing/:slug", controller.pricing);
router.post("/favorite/:status/:id", controller.favorite);
// router.get("/payment-momo/return", controller.return);
// router.post("/payment-momo/notify", controller.notify);

module.exports = router;
