
const express = require("express");
const mongoose = require("mongoose");
const Device = require("../models/Device");

const router = express.Router();

const allowedFields = [
  "deviceId",
  "name",
  "deviceType",
  "room",
  "brand",
  "model",
  "quantity",
  "status",
  "purchaseDate",
  "description"
];

function cleanInput(body) {
  if (!body || typeof body !== "object" ||
      Array.isArray(body)) {
    return null;
  }

  const result = {};

  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      result[key] = body[key];
    }
  }

  return result;
}

function handleError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã thiết bị đã tồn tại"
    });
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      error: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Lỗi máy chủ hoặc cơ sở dữ liệu"
  });
}

// GET /api/devices?search=...
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    let filter = {};

    if (search) {
      const safe = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(safe, "i");

      filter = {
        $or: [
          { deviceId: regex },
          { name: regex },
          { deviceType: regex },
          { room: regex }
        ]
      };
    }

    const devices = await Device.find(filter)
      .sort({ deviceId: 1 });

    res.status(200).json(devices);
  } catch (error) {
    handleError(res, error);
  }
});

// GET /api/devices/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    res.status(200).json(device);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /api/devices
router.post("/", async (req, res) => {
  try {
    const data = cleanInput(req.body);

    if (!data) {
      return res.status(400).json({
        message: "Dữ liệu gửi lên không hợp lệ"
      });
    }

    const device = await Device.create(data);

    res.status(201).json({
      message: "Thêm thiết bị thành công",
      device
    });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT /api/devices/:id
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const data = cleanInput(req.body);

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Không có dữ liệu cập nhật hợp lệ"
      });
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      {
        new: true,
        runValidators: true,
        context: "query"
      }
    );

    if (!device) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    res.status(200).json({
      message: "Cập nhật thành công",
      device
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /api/devices/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const device = await Device.findByIdAndDelete(
      req.params.id
    );

    if (!device) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    res.status(200).json({
      message: "Xóa thiết bị thành công"
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
