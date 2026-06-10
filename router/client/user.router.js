const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const controller = require("../../controller/client/user.controller");
const middlewareUpload = require("../../middleware/admin/uploadImage.middleware");

router.get("/info", controller.info);
router.patch(
    "/info/edit", 
    upload.single("avatar"),
    middlewareUpload.uploadSingle,
    controller.editPatch
);
router.patch("/bank-refund/edit", controller.refund);
// router.get("/pricing/:slug", controller.pricing);
// router.get("/payment-vnpay", controller.vnpay);
// router.get("/payment-momo/return", controller.return);
// router.post("/payment-momo/notify", controller.notify);

module.exports = router;
