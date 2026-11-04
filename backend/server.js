
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const deviceRoutes = require("./routes/devices");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

// Kiểm tra Backend và MongoDB
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "database_disconnected"
  });
});

// API quản lý thiết bị
app.use("/api/devices", deviceRoutes);

// Xử lý đường dẫn không tồn tại
app.use((req, res) => {
  res.status(404).json({
    message: "Không tìm thấy API"
  });
});

// Xử lý JSON không hợp lệ và lỗi chung
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      message: "JSON gửi lên không hợp lệ"
    });
  }

  console.error(err);
  res.status(500).json({
    message: "Lỗi máy chủ"
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thiếu biến MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });

    // Đảm bảo chỉ mục unique của deviceId
    const Device = require("./models/Device");
    await Device.init();

    console.log("MongoDB Atlas kết nối thành công!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend chạy tại http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Lỗi Backend:", error.message);
    process.exit(1);
  }
}

startServer();
