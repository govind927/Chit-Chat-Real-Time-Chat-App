import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Room from "../models/Room.js";

export const initSocket = (io) => {
  const authUser = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findById(decoded.id).select("username");
    } catch {
      return null;
    }
  };

  // Track participants per room
  const roomParticipants = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", async ({ token, roomId, username }) => {
      const user = await authUser(token);
      if (!user) {
        socket.emit("error", "Authentication failed");
        return;
      }

      socket.data.user = user;
      socket.data.username = username;
      socket.data.roomId = roomId;
      socket.join(roomId);

      // Track participants
      if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Map());
      roomParticipants.get(roomId).set(socket.id, { 
        username, 
        socketId: socket.id,
        isAdmin: false,
        joinedAt: new Date()
      });

      // Broadcast participants to room
      const participants = Array.from(roomParticipants.get(roomId).values());
      io.to(roomId).emit("participantsUpdate", participants);
      
      socket.emit("joinedRoom", { roomId, participants });
      console.log(`${username} joined room ${roomId}`);
    });

    socket.on("chatMessage", ({ token, roomId, text }) => {
      const userData = socket.data;
      if (!userData || !roomId) return;

      const timestamp = new Date().toISOString();
      
      io.to(roomId).emit("chatMessage", {
        socketId: socket.id,
        username: userData.username,
        text: text.trim(),
        timestamp,
        isAdmin: userData.isAdmin || false
      });
    });

    socket.on("kickUser", async ({ targetSocketId }) => {
      const roomId = socket.data?.roomId;
      if (!roomId || !roomParticipants.has(roomId)) return;

      // Admin kicks user
      const kickedUser = roomParticipants.get(roomId).get(targetSocketId);
      if (kickedUser) {
        io.to(targetSocketId).emit("kicked", "Kicked by admin");
        roomParticipants.get(roomId).delete(targetSocketId);
        
        const participants = Array.from(roomParticipants.get(roomId).values());
        io.to(roomId).emit("participantsUpdate", participants);
        io.to(roomId).emit("systemMessage", `${socket.data.username} kicked ${kickedUser.username}`);
      }
    });

    socket.on("dismissRoom", async ({ token, roomId }) => {
      const user = await authUser(token);
      if (!user || !roomParticipants.has(roomId)) return;

      // Admin dismisses room
      const adminName = user.username;
      
      // Notify ALL users: Room closed!
      io.to(roomId).emit("roomDismissed", {
        message: `${adminName} closed the room. No more messages allowed.`,
        timestamp: new Date().toISOString()
      });

      // Clear tracking + kick everyone
      roomParticipants.delete(roomId);
      io.in(roomId).socketsLeave(roomId);
      
      console.log(`Room ${roomId} dismissed by ${adminName}`);
    });

    socket.on("disconnect", () => {
      const roomId = socket.data?.roomId;
      if (roomId && roomParticipants.has(roomId)) {
        const disconnectedUser = roomParticipants.get(roomId).get(socket.id);
        roomParticipants.get(roomId).delete(socket.id);
        
        const participants = Array.from(roomParticipants.get(roomId).values());
        io.to(roomId).emit("participantsUpdate", participants);
        
        if (disconnectedUser) {
          io.to(roomId).emit("systemMessage", `${disconnectedUser.username} left the room`);
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};
