const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true }, // ID để định danh tin nhắn
    sender: { type: String, required: true }, // Người gửi: 'agent' hoặc 'user'
    content: { type: String, required: true }, // Nội dung tin nhắn
    avatar: { type: String, default: '' }, // Avatar người dùng (chỉ cần cho user)
    tags: [{ type: String }] // Các tag liên quan đến tin nhắn
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Chat', chatSchema)
