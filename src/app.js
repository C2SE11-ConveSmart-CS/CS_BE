require("dotenv").config();
const { app, server } = require("./app/lib/socket.io");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./app/routes/auth");
const chatRoutes = require("./app/routes/messenger");
const instaRoutes = require("./app/routes/instagram")
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: [process.env.FRONT_END_URL],
    credentials: true,

  })
);
// const allowedOrigins = [process.env.FRONT_END_URL];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Nếu origin nằm trong danh sách được phép, cho phép truy cập
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );
console.log(process.env.FRONT_END_URL);

app.use(express.json()); // Xử lý các yêu cầu JSON
app.use("/api/auth", authRoutes); // Đăng ký các route xác thực
app.use("/api/chats", chatRoutes);
app.use("/api/insta", instaRoutes);


// Kết nối với MongoDB
mongoose
  .connect(process.env.DB_URL, {
    dbName: 'test',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối MongoDB thành công");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.send("Chào mừng đến với API!");
});

// Khởi chạy server
server.listen(PORT, () => console.log(`Server listenning on port ${PORT}...`));
