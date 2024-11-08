const { notifyAdminsAndEmployee } = require('../lib/socket.io')
const Conversation = require('../models/conversation')
const Message = require('../models/message')
const fetch = require('node-fetch');

class InstagramService {
  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.apiUrl = 'https://graph.instagram.com/v17.0';
  }

  // Lấy thông tin người dùng
  async getUserInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/me?fields=id,username,media_count&access_token=${this.accessToken}`);
      const userInfo = await response.json();
      console.log('Thông tin người dùng:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  }

  // Lấy danh sách bài đăng
  async getUserMedia() {
    try {
      const response = await fetch(`${this.apiUrl}/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${this.accessToken}`);
      const media = await response.json();
      console.log('Danh sách bài đăng:', media);
      return media;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài đăng:', error);
    }
  }

  // Lấy chi tiết của một bài đăng
  async getMediaDetails(mediaId) {
    try {
      const response = await fetch(`${this.apiUrl}/${mediaId}?fields=id,caption,media_type,media_url,permalink&access_token=${this.accessToken}`);
      const mediaDetails = await response.json();
      console.log('Chi tiết bài đăng:', mediaDetails);
      return mediaDetails;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài đăng:', error);
    }
  }

  // Gửi tin nhắn 
  async sendMessage(senderId, messageText) {
    try {
      const response = await fetch(`${this.apiUrl}/me/messages?access_token=${this.accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: { text: messageText },
        }),
      });
      const result = await response.json();
      console.log('Tin nhắn đã gửi thành công:', result);
      return result;
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  }

  // Lưu tin nhắn và thông báo cho các admin và nhân viên
  async saveMessages(senderId, messages) {
    try {
      let conversation = await Conversation.findOne({
        senderId
      })
      if (!conversation) {
        conversation = await Conversation.create({
          senderId,
          lastSeenId: null
        })
      }
      await Promise.all(
        messages.map(async (message) => {
          const { text } = message
          if (text) {
            const newMessage = new Message({
              senderId,
              content: text
            })
            if (newMessage) {
              conversation.messages.push(newMessage._id)
            }
            await Promise.all([conversation.save(), newMessage.save()])
            console.log('send')
            notifyAdminsAndEmployee(newMessage)
          }
        })
      )
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  // Lấy danh sách cuộc trò chuyện
  async getConversations() {
    try {
      const conversations = await Conversation.find({})
        .populate('senderId', '_id username profile_picture_url')
        .populate('lastSeenId', '_id username profile_picture_url')
        .populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit: 1 },
        });
      return { chats: conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }

  // Lấy lịch sử tin nhắn
  async getHistory(idConversation, limit = 20) {
    try {
      const conversation = await Conversation.findById(idConversation)
        .populate('senderId', '_id username profile_picture_url')
        .populate('lastSeenId', '_id username profile_picture_url')
        .populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit },
        });
      if (conversation.messages) {
        conversation.messages.reverse();
      }
      return { messages: conversation.messages };
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }
}

const instagramService = new InstagramService();
module.exports = instagramService;
