const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user') // Đảm bảo đường dẫn đúng
const router = express.Router()

// Secret key cho JWT
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret' // Thay thế bằng biến môi trường

// Đăng ký
router.post('/signup', async (req, res) => {
  // Đổi tên route thành /signup
  const { username, email, password, firstname, lastname } = req.body

  // Kiểm tra đầu vào
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tất cả các trường đều bắt buộc' })
  }

  try {
    // Kiểm tra nếu người dùng đã tồn tại
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'Người dùng đã tồn tại' })
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // Tạo người dùng mới
    user = new User({
      username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      role: 'staff'
    })

    await user.save()
    return res.status(201).json({ message: 'Người dùng đã được đăng ký thành công', userId: user._id })
  } catch (error) {
    console.error(error) // Log lỗi để dễ dàng kiểm tra
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

// Đăng nhập
router.post('/signin', async (req, res) => {
  // Đổi tên route thành /signin
  const { email, password } = req.body

  // Kiểm tra đầu vào
  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })
  }

  try {
    // Kiểm tra người dùng
    const user = await User.findOne({
      email,
      role: {
        $ne: 'customer'
      }
    })
    if (!user) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' })
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' })
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })
    return res.json({ token, userId: user._id, username: user.username }) // Trả về thêm thông tin người dùng
  } catch (error) {
    console.error(error) // Log lỗi để dễ dàng kiểm tra
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

module.exports = router // Giữ nguyên
