const express = require('express')
const app = express()
const { createServer } = require('http')
const { Server } = require('socket.io')
const User = require('../models/user') // Đảm bảo đường dẫn đúng

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONT_END_URL],
    credentials: true
  }
})

const employeeMap = {}
const adminMap = {}

function notifyAdminsAndEmployee(newMessage) {
  Object.values(employeeMap).forEach((socketId) => {
    io.to(socketId).emit('newMessage', newMessage)
  })
  Object.values(adminMap).forEach((socketId) => {
    io.to(socketId).emit('newMessage', newMessage)
  })
}

io.on('connection', async (socket) => {
  console.log('User connected', socket.id)

  const { userId } = socket.handshake.query
  const user = await User.findById(userId)
  if (user) {
    const { role } = user
    console.log(userId, role)
    if (role === 'staff') {
      employeeMap[userId] = socket.id
    } else if (role === 'admin') {
      adminMap[userId] = socket.id
    }
  }

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id)
    delete employeeMap[userId]
    delete adminMap[userId]
  })
})

module.exports = { app, io, server, notifyAdminsAndEmployee }
