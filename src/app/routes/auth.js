const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Secret key cho JWT
const JWT_SECRET = 'your_jwt_secret';

// Đăng ký (fix ) ???
router.post('/SignUp', async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;

  try {
    // Kiểm tra nếu người dùng đã tồn tại
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Đăng nhập
router.post('/SigIn', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, userId: user._id });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
