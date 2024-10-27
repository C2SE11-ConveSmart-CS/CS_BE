const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./app/models/user");
const Organization = require("./app/models/organization");
const Group = require("./app/models/group");
const authRoutes = require("./app/routes/auth");
const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors());
app.use(express.json()); // Xử lý các yêu cầu JSON
app.use("/api/auth", authRoutes); // Đăng ký các route xác thực

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

// Khởi chạy server
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
