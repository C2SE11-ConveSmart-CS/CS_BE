const express = require("express");
const router = express.Router();
const instaService = require("../services/instagram.services");
const conversation = require("../models/conversation");
const { notifyAdminsAndEmployee } = require("../lib/socket.io");
require("dotenv").config();

// router.get("/", (req, res) => {
//   const {
//     "hub.mode": mode,
//     "hub.challenge": challenge,
//     "hub.verify_token": token,
//   } = req.query;
//   const result = instaService.verifyInstaApi(mode, token);
//   if (result) {
//     res.status(200).send(challenge);
//     return;
//   }
//   res.sendStatus(400);
// });

// router.post("/", (req, res) => {
//   if (req.body?.object === "instagram") {
//     req?.body?.entry.forEach((e) => {
//       console.log("new insta message >> ", e.messaging[0].sender)
//     });
//   }
//   res.sendStatus(200);
// });

router.get("/conversations", async (req, res) => {
  try {
    const { data } = await instaService.getConversations();

    const dataTranform = data.map(async (d) => {
      let convers = {};
      const conversationId = d?.id;

      convers["id"] = conversationId;

      const { messages } = await instaService.getMessages({
        conversationId,
      });

      const {
        from,
        to,
        created_time: time,
        message,
      } = await instaService.getMessage({
        messageId: messages?.data[0]?.id,
      });

      if (!to || to?.data.length <= 0) return;

      const senderId = await instaService.getIGSID({ from, to });

      const {
        name,
        username,
        profile_pic: avatar,
      } = await instaService.getInfo({
        IGSID: senderId,
      });

      convers = {
        ...convers,
        name,
        avatar,
        time,
        senderId,
        lastMessage: message,
        type: "instagram",
        social: [
          "data:image/png;base64,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",
        ],
      };

      return convers;
    });

    const result = await Promise.all(dataTranform);
    return res.status(200).json({ chats: result.filter((r) => !!r) });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { messages } = await instaService.getMessages({
      conversationId,
    });

    const messageTemplates = messages?.data.map(async (m) => {
      const {
        from,
        to,
        message: content,
        attachment,
      } = await instaService.getMessage({
        messageId: m?.id,
      });

      const senderInfo = await instaService.getInfo({
        IGSID: from?.id,
        isAgent: from?.id === process.env.IGID,
      });

      const messageTemplate = {
        sender: from?.id === process.env.IGID ? "agent" : from?.id,
        content,
        avatar: senderInfo?.profile_pic,
      };
      return messageTemplate;
    });

    const result = await Promise.all(messageTemplates);

    return res.status(200).json({ messages: result });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/message/:recipientID", async (req, res) => {
  try {
    const { recipientID } = req.params;
    const { text, attachment } = req.body;
    let result = {};
    if (text) {
      result = await instaService.sendMessage({
        IGSID: recipientID,
        text,
      });
    } else if (attachment) {
      result = await instaService.sendMessage({
        IGSID: recipientID,
        attachment,
      });
    } else {
      res.status(404).send("send message failed");
    }
    return res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/messages/bot/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { messages } = await instaService.getMessages({
      conversationId,
    });

    const messageTemplates = messages?.data.map(async (m) => {
      const {
        from,
        to,
        message: content,
        attachment,
      } = await instaService.getMessage({
        messageId: m?.id,
      });

      let enhancedContent = content; 
      try {
        const response = await fetch(
          `http://workable-goshawk-adjusted.ngrok-free.app/rag/dtu?q=${encodeURIComponent(content)}`,
          {
            method: 'GET',
          }
        );

        if (response.ok) {
          const result = await response.json();
          enhancedContent = result?.result || content; 
        }
      } catch (apiError) {
        console.error("Lỗi khi gọi API RAG:", apiError);
      }

      const senderInfo = await instaService.getInfo({
        IGSID: from?.id,
        isAgent: from?.id === process.env.IGID,
      });

      const messageTemplate = {
        sender: from?.id === process.env.IGID ? "agent" : from?.id,
        content: enhancedContent, 
        avatar: senderInfo?.profile_pic,
      };
      return messageTemplate;
    });

    const result = await Promise.all(messageTemplates);

    return res.status(200).json({ messages: result });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
