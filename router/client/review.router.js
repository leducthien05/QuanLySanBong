const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/review.controller");

router.post("/create/:id", controller.create);

module.exports = router;
