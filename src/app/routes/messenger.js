const express = require("express");
const messengerService = require("../services/messenger.services");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { randomString } = require("../lib/util");
const router = express.Router();

router.get("/", (req, res) => {
  // console.log("123123123123", req.query);
  const {
    "hub.mode": mode,
    "hub.challenge": challenge,
    "hub.verify_token": token,
  } = req.query;
  const result = messengerService.verifyMessengerApi(mode, token);
  if (result) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(400);
});

router.post("/", async (req, res) => {
  const body = req.body;
  console.log("ngu", body);

  if (body.object === "page") {
    // console.log("troll");
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
    // sendMessage(senderId, `You sent: ${receivedMessage}`)
    Object.keys(messageMap).forEach(async (senderId) => {
      console.log("senderID: ", senderId);
      const userInfoFb = await messengerService.fetchUserInfo(senderId);
      if (userInfoFb) {
        const {
          id,
          name,
          picture: {
            data: { url },
          },
        } = userInfoFb;
        // console.log(url)
        if (id && name) {
          let user = await User.findOne({ username: id });
          if (!user) {
            const hashedPassword = await bcrypt.hash(randomString(12), 10);
            user = await User.create({
              username: id,
              normalize: name,
              password: hashedPassword,
              avatar: url,
            });
          }
          // console.log(user)
          await messengerService.saveMessages(user._id, messageMap[senderId]);
        }
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

router.get("/conversations", async (req, res) => {
  // console.log("hahaha");
  const result = await messengerService.getConversations();
  res.status(200).json(result);
});

router.get("/conversations/:id", async (req, res) => {
  console.log("oke");
  const { id } = req.params;
  const result = await messengerService.getHistory(id);
  res.status(200).json(result);
});

// API lấy username từ senderId
router.get("/getUsername/:senderId", async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const user = await User.findOne({ username: senderId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send_message/:senderID", async (req, res) => {
  console.log(req.body);
  const { senderID } = req.params;
  const result = await messengerService.sendMessage(senderID, req.body.text);
  res.status(201).json(result);
});

module.exports = router;
