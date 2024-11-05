const axios = require("axios");

const sendWhatsAppMessage = async (messageData) => {
  try {
    const response = await axios({
      url: "https://graph.facebook.com/v20.0/505712559281612/messages",
      method: "post",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: messageData,
    });

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw new Error("Failed to send message");
  }
};

module.exports = {
  sendWhatsAppMessage,
};
