
const mongoose = require("mongoose");

const STATUS = [
  "Đang sử dụng",
  "Hư hỏng",
  "Đang sửa chữa",
  "Ngừng sử dụng"
];

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "Mã thiết bị là bắt buộc"],
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: [true, "Tên thiết bị là bắt buộc"],
      trim: true
    },

    deviceType: {
      type: String,
      required: [true, "Loại thiết bị là bắt buộc"],
      trim: true
    },

    room: {
      type: String,
      required: [true, "Phòng học là bắt buộc"],
      trim: true
    },

    brand: {
      type: String,
      required: [true, "Hãng sản xuất là bắt buộc"],
      trim: true
    },

    model: {
      type: String,
      required: [true, "Model là bắt buộc"],
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: [0, "Số lượng không được âm"],
      validate: {
        validator: Number.isInteger,
        message: "Số lượng phải là số nguyên"
      }
    },

    status: {
      type: String,
      enum: {
        values: STATUS,
        message: "Tình trạng thiết bị không hợp lệ"
      },
      required: true
    },

    purchaseDate: {
      type: Date,
      required: [true, "Ngày mua là bắt buộc"]
    },

    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model(
  "Device",
  deviceSchema,
  "devices"
);
