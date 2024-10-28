const mongoose = require('mongoose')

const ConversationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    lastSeenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: []
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Conversation', ConversationSchema)
