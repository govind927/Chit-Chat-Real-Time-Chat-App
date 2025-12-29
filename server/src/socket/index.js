import jwt from "jsonwebtoken";
import Room from "../models/Room.js";

export const initSocket = (io) => {
  // auth helper for sockets
  const authUser = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { id: decoded.id };
    } catch {
      return null;
    }
  };

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("joinRoom", async ({ token, roomId }) => {
      const user = await authUser(token);
      if (!user) return socket.emit("errorMessage", "Authentication failed");

      const room = await Room.findOne({ roomId });
      if (!room) return socket.emit("errorMessage", "Room not found");

      socket.join(roomId);
      socket.data.userId = user.id;
      socket.data.roomId = roomId;

      socket.to(roomId).emit("systemMessage", {
        text: "A new user joined the room",
        timestamp: new Date().toISOString()
      });
    });

    socket.on("chatMessage", async ({ token, roomId, text }) => {
      const user = await authUser(token);
      if (!user) return;

      const room = await Room.findOne({ roomId }).populate("admin", "_id");
      if (!room) return;

      const isAdmin = room.admin._id.toString() === user.id.toString();
      const timestamp = new Date().toISOString();

      io.to(roomId).emit("chatMessage", {
        userId: user.id,
        text,
        timestamp,
        isAdmin
      });
      // note: message not stored anywhere => anonymous
    });

    // Admin kicks a user by socket id
    socket.on("kickUser", async ({ token, roomId, targetSocketId }) => {
      const user = await authUser(token);
      if (!user) return;

      const room = await Room.findOne({ roomId });
      if (!room) return;

      if (room.admin.toString() !== user.id.toString()) return;

      io.to(targetSocketId).emit("kicked");
      io.sockets.sockets.get(targetSocketId)?.leave(roomId);
    });

    socket.on("dismissRoom", async ({ token, roomId }) => {
      const user = await authUser(token);
      if (!user) return;

      const room = await Room.findOne({ roomId });
      if (!room) return;

      if (room.admin.toString() !== user.id.toString()) return;

      io.to(roomId).emit("roomDismissed");
      await Room.deleteOne({ _id: room._id }); // no record of room
      io.in(roomId).socketsLeave(roomId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
};
