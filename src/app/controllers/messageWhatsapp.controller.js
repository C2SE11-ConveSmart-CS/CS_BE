const messageWhatsappService = require("../services/messageWhatsapp.service");

const sendTextMessage = async (req, res) => {
  const { recipientNumber, messageBody } = req.body;

  try {
    const data = {
      messaging_product: "whatsapp",
      to: recipientNumber,
      type: "text",
      text: { body: messageBody },
    };

    const response = await messageWhatsappService.sendWhatsAppMessage(data);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendTextMessage,
};
