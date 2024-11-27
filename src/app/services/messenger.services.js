const { notifyAdminsAndEmployee } = require("../lib/socket.io");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

class MessengerService {
  constructor() {
    this.accessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
    this.messengerVerifyToken = process.env.MESSENGER_API_VERIFY_TOKEN;
    this.pageId = process.env.PAGE_ID;
  }
  verifyMessengerApi(mode, token) {
    // console.log(mode, token, this.messengerVerifyToken)
    if (mode && token === this.messengerVerifyToken) {
      return true;
    }
  }

  getConversations = async() => {
    const data = await fetch(
      `https://graph.facebook.com/v21.0/${this.pageId}/conversations?access_token=${this.accessToken}`
    );
    return data.json();
  }

  getMessages = async ({conversationId})=>{
    const data = await fetch(`https://graph.facebook.com/v21.0/${conversationId}?fields=messages&access_token=${this.accessToken}`)
    return data.json()
  }

  getMessage = async ({ messageId }) => {
    const data = await fetch(
      `https://graph.facebook.com/v21.0/${messageId}?fields=id,created_time,from,to,message&access_token=${this.accessToken}`
    );
    return data.json();
  };

  getPSID = async ({ from, to }) => {
    return from?.id === this.pageId ? to.data[0]?.id : from?.id;
  };

  getInfo = async ({ PSID, isAgent }) => {
    let data;
    if (isAgent) {
      data = await fetch(
        `https://graph.facebook.com/v21.0/${PSID}?fields=name&access_token=${this.accessToken}`
      );
    } else {
      data = await fetch(
        `https://graph.facebook.com/v21.0/${PSID}?fields=name,profile_pic&access_token=${this.accessToken}`
      );
    }
    return data.json();
  };

  async sendMessage({senderID, text, attachment}) {
    return fetch(`https://graph.facebook.com/v21.0/${this.pageId}/messages?`, {
      method: 'POST',
      headers: {
        'Authorization' : `Bearer ${this.accessToken}`,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(text && {
        'recipient' : {'id': senderID},
        'message' : { text }
      } || {
        'recipient' : {'id': senderID},
        'message' : { attachment }
      })
    }).then(r=>r.json())  
  }

  // async fetchUserInfo(senderId) {
  //   const url = `https://graph.facebook.com/v21.0/${senderId}?fields=id,name,picture&access_token=${this.accessToken}`;
  //   try {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const userInfo = await response.json();
  //     return userInfo;
  //   } catch (error) {
  //     console.error("Error fetching user info:", error);
  //   }
  // }

  // async saveMessages(senderId, messages) {
  //   try {
  //     let conversation = await Conversation.findOne({
  //       senderId,
  //     });
  //     if (!conversation) {
  //       conversation = await Conversation.create({
  //         senderId,
  //         lastSeenId: null,
  //       });
  //     }
  //     await Promise.all(
  //       messages.map(async (message) => {
  //         const { text } = message;
  //         if (text) {
  //           const newMessage = new Message({
  //             senderId,
  //             content: text,
  //           });
  //           if (newMessage) {
  //             conversation.messages.push(newMessage._id);
  //           }
  //           await Promise.all([conversation.save(), newMessage.save()]);
  //           console.log("send");
  //           notifyAdminsAndEmployee(newMessage);
  //         }
  //       })
  //     );
  //   } catch (error) {
  //     console.error("Error saving messages:", error);
  //   }
  // }

  // async getHistory(idConversation, limit = 20) {
  //   try {
  //     const conversation = await Conversation.findById(idConversation)
  //       .populate("senderId", "_id normalize avatar")
  //       .populate("lastSeenId", "_id normalize avatar")
  //       .populate({
  //         path: "messages",
  //         options: { sort: { createdAt: -1 }, limit },
  //       });
  //     if (conversation.messages) {
  //       conversation.messages.reverse();
  //     }
  //   } catch (error) {
  //     console.error("Error fetching conversations:", error);
  //   }
  // }
}

const messengerService = new MessengerService();
module.exports = messengerService;
