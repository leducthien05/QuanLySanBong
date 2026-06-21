const express = require("express");
const router = express.Router();

const controller = require("../../controller/client/chatbot.controller");

router.post("/", controller.ask);
router.post("/reset", controller.resetChat);
module.exports = router;
