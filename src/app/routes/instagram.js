const express = require('express');
const instagramService = require('../services/instagram.services');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { randomString } = require('../lib/util');
const router = express.Router();

// Xác minh webhook của Instagram
router.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  const result = instagramService.verifyApi(mode, token);
  if (result) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(400);
});

// Xử lý tin nhắn nhận được từ Instagram
router.post('/', async (req, res) => {
  const body = req.body;
  if (body.object === 'instagram') {
    const messageMap = {};
    body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      if (!messageMap[senderId]) {
        messageMap[senderId] = [];
      }
      if (event.message) {
        const { attachments, text } = event.message;
        messageMap[senderId].push({ attachments, text });
      }
    });

    // Lưu tin nhắn và gửi phản hồi
    Object.keys(messageMap).forEach(async (senderId) => {
      const userInfo = await instagramService.fetchUserInfo(senderId);
      if (userInfo) {
        const { id, username, profile_picture_url } = userInfo;
        if (id && username) {
          let user = await User.findOne({ username: id });
          if (!user) {
            const hashedPassword = await bcrypt.hash(randomString(12), 10);
            user = await User.create({
              username: id,
              normalize: username,
              password: hashedPassword,
              avatar: profile_picture_url,
            });
          }
          await instagramService.saveMessages(user._id, messageMap[senderId]);
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Lấy tất cả cuộc trò chuyện
router.get('/conversations', async (req, res) => {
  const result = await instagramService.getConversations();
  res.status(200).json(result);
});

// Lấy lịch sử tin nhắn theo ID cuộc trò chuyện
router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const result = await instagramService.getHistory(id);
  res.status(200).json(result);
});

module.exports = router;
