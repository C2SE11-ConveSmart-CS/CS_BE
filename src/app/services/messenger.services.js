const { notifyAdminsAndEmployee } = require('../lib/socket.io')
const Conversation = require('../models/conversation')
const Message = require('../models/message')

class MessengerService {
  constructor() {
    this.accessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN
    this.messengerVerifyToken = process.env.MESSENGER_API_VERIFY_TOKEN
  }
  verifyMessengerApi(mode, token) {
    // console.log(mode, token, this.messengerVerifyToken)
    if (mode && token === this.messengerVerifyToken) {
      return true
    }
  }
  async sendMessage(senderId, message) {
    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${this.accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: {
            id: senderId
          },
          message: {
            text: message
          }
        })
      })
      const data = await response.json()
      console.log('Message sent successfully:', data)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  async fetchUserInfo(senderId) {
    const url = `https://graph.facebook.com/v21.0/${senderId}?fields=id,name,picture&access_token=${this.accessToken}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const userInfo = await response.json()
      return userInfo
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }
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
  async getConversations() {
    try {
      const conversations = await Conversation.find({})
        .populate('senderId', '_id normalize avatar')
        .populate('lastSeenId', '_id normalize avatar')
        .populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit: 1 }
        })
      return {
        chats: conversations
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }
  async getHistory(idConversation, limit = 20) {
    try {
      const conversation = await Conversation.findById(idConversation)
        .populate('senderId', '_id normalize avatar')
        .populate('lastSeenId', '_id normalize avatar')
        .populate({
          path: 'messages',
          options: { sort: { createdAt: -1 }, limit }
        })
      if (conversation.messages) {
        conversation.messages.reverse()
      }
      return {
        messages: conversation.messages
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }
}

const messengerService = new MessengerService()
module.exports = messengerService
