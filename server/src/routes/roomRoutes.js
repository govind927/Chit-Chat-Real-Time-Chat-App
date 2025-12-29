import express from "express";
import Room from "../models/Room.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { generateRoomId } from "../utils/generateRoomId.js";

const router = express.Router();

router.post("/create", authRequired, async (req, res) => {
  try {
    const { name } = req.body;
    let id = generateRoomId();

    let exists = await Room.findOne({ roomId: id });
    while (exists) {
      id = generateRoomId();
      exists = await Room.findOne({ roomId: id });
    }

    const room = await Room.create({
      roomId: id,
      name,
      admin: req.user._id,
      participants: [{ user: req.user._id }]
    });

    res.json({
      roomId: room.roomId,
      name: room.name,
      isAdmin: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/join", authRequired, async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findOne({ roomId, isActive: true }).populate(
      "admin",
      "username"
    );
    if (!room) return res.status(404).json({ message: "Room not found" });

    const already = room.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (!already) {
      room.participants.push({ user: req.user._id });
      await room.save();
    }

    const isAdmin = room.admin._id.toString() === req.user._id.toString();

    res.json({
      roomId: room.roomId,
      name: room.name,
      adminName: room.admin.username,
      isAdmin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/leave", authRequired, async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findOne({ roomId, isActive: true });
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.participants = room.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );
    await room.save();
    res.json({ message: "Left room" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin dismiss room: room and all data deleted (no record)
router.post("/dismiss", authRequired, async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can dismiss" });

    await Room.deleteOne({ _id: room._id });
    res.json({ message: "Room dismissed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
