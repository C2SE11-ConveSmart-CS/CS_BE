const express = require("express");
const axios = require("axios");
const router = express.Router();
const chats = require("../models/chatmd");
// Lấy dữ liệu chat từ Facebook Messenger API
router.get("/chats", async (req, res) => {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v21.0/me/conversations?fields=id%2Cmessages%7Bmessage%7D%2Csenders%2Cwallpaper&access_token=EAAkgCxvM7NkBOy0ZBjRkyWalCXki1S7Jn4GoSZCF1FyZBcpUsQxDTrGaHIm1UH09soTlVkTc9nfp461k4dN7ZCudJtZCXFtpSs4La9Jf32Eg1691jXMcjrk8ooZA5vtZAgpfwFSWZAZCz1zMr1W3wC3tNrxuDG1Ai0V5XMnTuh3abTMz4ellFQn3JmRUXjdCxREEqyhcjgDSe65wnCLfZA23QZCF86S"
    );

    // Chuyển đổi dữ liệu thành định dạng mong muốn
    const chats = response.data.data.map((item) => ({
      id: item.id, // ID của tin nhắn
      sender: item.sender.id, // Xác định người gửi
      content: item.message && item.message.text ? item.message.text : "", // Nội dung tin nhắn
      avatar: item.sender.wallpaper || "", // Avatar người gửi
      tags: item.tags || [], // Tags nếu có
      timestamp: item.created_time, // Thời gian tạo
    }));

    res.json({ messages: chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Error fetching chats" });
  }
});

// Các route khác nếu cần

module.exports = router;
