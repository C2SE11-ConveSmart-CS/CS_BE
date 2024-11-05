require("dotenv").config();
const { app, server } = require("./app/lib/socket.io");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./app/routes/auth");
const chatRoutes = require("./app/routes/messenger");
const PORT = process.env.PORT || 5001;
const messageWhatsappRouters = require("./app/routes/messageWhatsappRouter");

app.use(
  cors({
    origin: [process.env.FRONT_END_URL],
    credentials: true,
  })
);
app.use(express.json()); // Xử lý các yêu cầu JSON
app.use("/api/auth", authRoutes); // Đăng ký các route xác thực
app.use("/api/chats", chatRoutes);

// Kết nối với MongoDB
mongoose
  .connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối MongoDB thành công");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
  });

// Route gốc đơn giản
app.get("/", (req, res) => {
  res.send("Chào mừng đến với API!");
});

app.use("/api/messages", messageWhatsappRouters);

// Khởi chạy server
server.listen(PORT, () => console.log(`Server listenning on port ${PORT}...`));
