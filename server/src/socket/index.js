import jwt from "jsonwebtoken";
import { Server } from "socket.io";

const roomParticipants = new Map();

export const initSocket = (io) => {
  console.log("Socket.IO server initialized");

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("joinRoom", async ({ token, roomId, username }) => {
      console.log("🔄 Join attempt:", { socketId: socket.id, roomId, username, hasToken: !!token });
      
      try {
        // Simplified auth - bypass User model for now
        socket.data = { username: username || "Anonymous", roomId };
        socket.join(roomId);

        // Track participants
        if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Map());
        roomParticipants.get(roomId).set(socket.id, { 
          username: socket.data.username,
          socketId: socket.id,
          joinedAt: new Date()
        });

        const participants = Array.from(roomParticipants.get(roomId).values());
        io.to(roomId).emit("participantsUpdate", participants);
        
        socket.emit("joinedRoom", { success: true, roomId, participants });
        console.log("✅ User joined:", username, "Room:", roomId);
      } catch (error) {
        console.error("❌ Join error:", error);
        socket.emit("error", "Join failed: " + error.message);
      }
    });

    socket.on("chatMessage", ({ roomId, text }) => {
      const userData = socket.data;
      if (!userData || !roomId) return;

      const timestamp = new Date().toISOString();
      io.to(roomId).emit("chatMessage", {
        socketId: socket.id,
        username: userData.username,
        text: text.trim(),
        timestamp,
        isAdmin: false
      });
      console.log("💬 Message:", text.slice(0, 50));
    });

    socket.on("kickUser", ({ targetSocketId }) => {
      const roomId = socket.data?.roomId;
      if (!roomId || !roomParticipants.has(roomId)) return;

      const kickedUser = roomParticipants.get(roomId).get(targetSocketId);
      if (kickedUser) {
        io.to(targetSocketId).emit("kicked", "Kicked by admin");
        roomParticipants.get(roomId).delete(targetSocketId);
        const participants = Array.from(roomParticipants.get(roomId).values());
        io.to(roomId).emit("participantsUpdate", participants);
        io.to(roomId).emit("systemMessage", `${socket.data.username} kicked ${kickedUser.username}`);
      }
    });

    socket.on("dismissRoom", ({ roomId }) => {
      if (!roomId || !roomParticipants.has(roomId)) return;

      io.to(roomId).emit("roomDismissed", {
        message: `${socket.data.username} closed the room`,
        timestamp: new Date().toISOString()
      });

      roomParticipants.delete(roomId);
      io.in(roomId).socketsLeave(roomId);
      console.log(`🚪 Room ${roomId} dismissed`);
    });

    socket.on("disconnect", () => {
      const roomId = socket.data?.roomId;
      if (roomId && roomParticipants.has(roomId)) {
        roomParticipants.get(roomId).delete(socket.id);
        const participants = Array.from(roomParticipants.get(roomId).values());
        io.to(roomId).emit("participantsUpdate", participants);
      }
    });
  });
};
