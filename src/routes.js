const express = require("express");
const router = express.Router();
const webhookController = require("./controllers/webhookController");

router.post("/gitlab/webhook", webhookController.handleWebhook);

module.exports = router;

