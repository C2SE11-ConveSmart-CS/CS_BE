const express = require("express");
const router = express.Router();
const messageWhatsappController = require("../controllers/messageWhatsapp.controller");

router.post("/send-text", messageWhatsappController.sendTextMessage);

module.exports = router;
