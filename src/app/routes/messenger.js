const express = require("express");
const messengerService = require("../services/messenger.services");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { randomString } = require("../lib/util");
const router = express.Router();

// router.get("/", (req, res) => {
//   const {
//     "hub.mode": mode,
//     "hub.challenge": challenge,
//     "hub.verify_token": token,
//   } = req.query;
//   const result = messengerService.verifyMessengerApi(mode, token);
//   if (result) {
//     res.status(200).send(challenge);
//     return;
//   }
//   res.sendStatus(400);
// });

// router.post("/", async (req, res) => {
//   const body = req.body;
//   if (body.object === "page") {
//     // console.log("troll");
//     const messageMap = {};
//     body.entry.forEach(async (entry) => {
//       const event = entry.messaging[0];
//       const senderId = event.sender.id;
//       if (!messageMap[senderId]) {
//         messageMap[senderId] = [];
//       }
//       if (event.message) {
//         const { attachments, text } = event.message;
//         messageMap[senderId].push({ attachments, text });
//       }
//     });
//     // sendMessage(senderId, `You sent: ${receivedMessage}`)
//     Object.keys(messageMap).forEach(async (senderId) => {
//       console.log("senderID: ", senderId);
//       const userInfoFb = await messengerService.fetchUserInfo(senderId);
//       if (userInfoFb) {
//         const {
//           id,
//           name,
//           picture: {
//             data: { url },
//           },
//         } = userInfoFb;
//         if (id && name) {
//           let user = await User.findOne({ username: id });
//           if (!user) {
//             const hashedPassword = await bcrypt.hash(randomString(12), 10);
//             user = await User.create({
//               username: id,
//               normalize: name,
//               password: hashedPassword,
//               avatar: url,
//             });
//           }
//           // console.log(user)
//           await messengerService.saveMessages(user._id, messageMap[senderId]);
//         }
//       }
//     });
//     res.status(200).send("EVENT_RECEIVED");
//   } else {
//     res.sendStatus(404);
//   }
// });

// router.get("/getUsername/:senderId", async (req, res) => {
//   try {
//     const senderId = req.params.senderId;
//     const user = await User.findOne({ username: senderId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ username: user.username });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/conversations", async (req, res) => {
  try {
    const { data } = await messengerService.getConversations();

    const dataTranform = data.map(async (d) => {
      let convers = {};
      const conversationId = d?.id;

      convers["id"] = conversationId;

      const { messages } = await messengerService.getMessages({
        conversationId,
      });

      const {
        from,
        to,
        created_time: time,
        message,
      } = await messengerService.getMessage({
        messageId: messages?.data[0]?.id,
      });

      if (!to || to?.data.length <= 0) return;

      const senderId = await messengerService.getPSID({ from, to });

      const { name, profile_pic: avatar } = await messengerService.getInfo({
        PSID: senderId,
      });

      convers = {
        ...convers,
        time,
        senderId,
        name,
        avatar,
        lastMessage: message,
        type: "messenger",
        social: [
          "data:image/png;base64, AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCCD/Zgig//Psz////////////2YI3/9nCZD/ZAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/2AAEP9lB5D/Zgj//2YI///r4P////////////9mCP//Zgj//2YI//9lCZD/cBAQAAAAAAAAAAAAAAAA/2AAEP9mB8//Zgj//2YI//9mCP//6+D/////////////Zgj//2YI//9mCP//Zgj//2YJz/9wEBAAAAAAAAAAAP9lB5D/Zgj//2YI//9mCP//Zgj//+vg/////////////2YI//9mCP//Zgj//2YI//9mCP//ZQmQAAAAAP9kCED/Zgj//2YI//9mCP//Zgj//2YI///r4P////////////9mCP//Zgj//2YI//9mCP//Zgj//2YI//9oCCD/ZQeQ/2YI//9mCP//Zgj//5ZV//+yg///9e//////////////soP//7KD//95J///Zgj//2YI//9mCP//Zwif/2YI3/9mCP//Zgj//2YI///Fov//////////////////////////////////lVX//2YI//9mCP//Zgj//2YHz/9mCP//Zgj//2YI//9mCP//xaL//////////////////////////////////7KD//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//6+D/////////////Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YHz/9mCP//Zgj//2YI//9mCP//Zgj//+vg/////////////3AY//9mCP//Zgj//2YI//9mCP//Zgj//2YI3/9mCKD/Zgj//2YI//9mCP//Zgj//2YI///Zwf/////////////Psf//n2T//5ZV//9mCP//Zgj//2YI//9lCZD/aAgg/2YI//9mCP//Zgj//2YI//9mCP//n2T////////////////////////Ywf//Zgj//2YI//9mCP//aAhAAAAAAP9mB4//Zgj//2YI//9mCP//Zgj//2YI//+pdP//7OD/////////////z7L//2YI//9mCP//ZgePAAAAAAAAAAD/cBAQ/2YJz/9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//ZgnP/2AQEAAAAAAAAAAAAAAAAP9wEBD/ZgeP/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//ZgeP/2AQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCED/ZwmQ/2YI3/9mCP//Zgj//2YJz/9nCJ//aAggAAAAAAAAAAAAAAAAAAAAAPAPAADAAwAAgAEAAIABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAACAAQAAwAMAAPAPAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9wEBD/ZQhg/+/noP///8/////v////////////697v/2YHz/9nCJ//ZQhg/3AQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCCD/Zgig/2YI//9mCP//6+D////////////////////////s4P//Zgj//2YI//9mCP//ZQfv/2cJkP9oCCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9gABD/ZQeQ/2YI//9mCP//Zgj//2YI///r4P///////////////////////+zg//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9lCZD/cBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/aAgg/2YI3/9mCP//Zgj//2YI//9mCP//Zgj//+vg////////////////////////7OD//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCN//aAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/2UFMP9mCN//Zgj//2YI//9mCP//Zgj//2YI//9mCP//6+D////////////////////////s4P//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCN//ZQUwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCCD/Zgjf/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI///r4P///////////////////////+zg//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCN//aAggAAAAAAAAAAAAAAAAAAAAAAAAAAD/YAAQ/2YI3/9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//+vg////////////////////////7OD//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCN//cBAQAAAAAAAAAAAAAAAAAAAAAP9lB5D/Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//6+D////////////////////////s4P//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9lCZAAAAAAAAAAAAAAAAD/aAgg/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI///r4P///////////////////////+zg//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9oCCAAAAAAAAAAAP9lB5D/Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//+vg////////////////////////7OD//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2cInwAAAAD/YAAQ/2UH7/9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//6+D////////////////////////s4P//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2AQEP9lCGD/Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//3kn///r4P//6+D//+vg///////////////////////////////////r4P//6+D//+vg///r4P//lVX//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zghf/2YIoP9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//eSf///////////////////////////////////////////////////////////////////////+yg///Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9nCJ//ZgfP/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//95J////////////////////////////////////////////////////////////////////////9jB//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YHz/9lB+//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//3kn////////////////////////////////////////////////////////////////////////7OD//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgfv/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//eSf/////////////////////////////////////////////////////////////////////////////cBj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//6+D////////////////////////s4P//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9lB+//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI///r4P///////////////////////+zg//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgfv/2YHz/9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//+vg/////////////////////////////2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mB8//Zgig/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//49D/////////////////////////////gzf//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2cIn/9lCGD/Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI///Psv/////////////////////////////j0f//cBj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//ZQhg/2AAEP9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//59k///////////////////////////////////17///4tD//9jB///Ywf//jEb//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YH7/9gEBAAAAAA/2YIoP9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//eSf///////////////////////////////////////////////////////+fZP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//ZQmQAAAAAAAAAAD/aAgg/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//s4T//////////////////////////////////////////////////59k//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9oCCAAAAAAAAAAAAAAAAD/ZgeP/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//s4T/////////////////////////////////////////////n2T//2YI//9mCP//Zgj//2YI//9mCP//ZgePAAAAAAAAAAAAAAAAAAAAAP9wEBD/Zgjf/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//jEX//7yT///s4P///////////////////////+PR//+VVf//Zgj//2YI//9mCP//Zgj//2YI3/9gEBAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCCD/Zgjf/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//cBj//3AY//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCN//aAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9lBTD/Zgjf/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgjf/2UFMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9oCCD/Zgjf/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI3/9oCCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9wEBD/ZgeP/2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mB48AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/aAgg/2cJkP9lB+//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9mCP//Zgj//2YI//9nCJ//aAggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/3AQEP9lCGD/Zwif/2YJz/9lB+//Zgj//2YI//9lB+//ZgnP/2cIn/9mCF//cBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AA///AAD//AAAP/gAAB/wAAAP4AAAB8AAAAPAAAADgAAAAYAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAcAAAAPAAAAD4AAAB/AAAA/4AAAf/AAAf/8AAP//wAP/",
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

    const { messages } = await messengerService.getMessages({
      conversationId,
    });

    const messageTemplates = messages?.data.map(async (m) => {
      const {
        from,
        to,
        message: content,
        attachment,
      } = await messengerService.getMessage({
        messageId: m?.id,
      });

      const senderInfo = await messengerService.getInfo({
        PSID: from?.id,
        isAgent: from?.id === process.env.PAGE_ID,
      });

      const messageTemplate = {
        sender: from?.id === process.env.PAGE_ID ? "agent" : from?.id,
        content,
        avatar: senderInfo?.profile_pic,
      };
      return messageTemplate;
    });

    const result = await Promise.all(messageTemplates);

    return res.status(200).json({ messages: result });
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post("/message/:senderID", async (req, res) => {
  try{
    const { senderID } = req.params;
    const { text, attachment } = req.body;
    let result = {};
    if (text) {
      result = await messengerService.sendMessage({
        senderID,
        text,
      });
    } else if (attachment) {
      result = await messengerService.sendMessage({
        senderID,
        attachment,
      });
    } else {
      res.status(404).send("Failed");
    }
    return res.status(201).json(result);
  }catch(err){
    res.status(500).json(err)
  }
});

module.exports = router;
