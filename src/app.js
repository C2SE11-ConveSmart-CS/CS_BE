const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./app/models/user');
const Organization = require('./app/models/organization');
const Group = require('./app/models/group');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối với MongoDB
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Đăng ký các route
app.use('/auth', require('./routes/auth'));

// Khởi chạy server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
