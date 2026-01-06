import jwt from "jsonwebtoken";
import Room from "../models/Room.js";

export const initSocket = (io) => {
  const authUser = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { id: decoded.id };
    } catch {
      return null;
    }
  };

  // roomId -> Map<socketId, { socketId, userId, username, isAdmin }>
  const roomParticipants = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("joinRoom", async ({ token, roomId }) => {
      try {
        if (!token || !roomId) {
          return socket.emit("errorMessage", "Missing token or room id");
        }

        const user = await authUser(token);
        if (!user) {
          return socket.emit("errorMessage", "Authentication failed");
        }

        const room = await Room.findOne({ roomId }).populate("admin", "username");
        if (!room) {
          return socket.emit("errorMessage", "Room not found");
        }

        const isAdmin = room.admin._id.toString() === user.id.toString();

        socket.join(roomId);
        socket.data.userId = user.id;
        socket.data.roomId = roomId;
        socket.data.isAdmin = isAdmin;

        if (!roomParticipants.has(roomId)) {
          roomParticipants.set(roomId, new Map());
        }
        const participantsMap = roomParticipants.get(roomId);

        const username = isAdmin
          ? room.admin.username
          : `User-${socket.id.slice(-4)}`;

        participantsMap.set(socket.id, {
          socketId: socket.id,
          userId: user.id,
          username,
          isAdmin
        });

        const participantsList = Array.from(participantsMap.values());

        // Tell the joining client join succeeded
        socket.emit("joinedRoom", {
          roomId,
          isAdmin,
          participants: participantsList
        });

        // Update everyone in the room
        io.to(roomId).emit("participantsUpdate", participantsList);

        socket.to(roomId).emit("systemMessage", {
          text: `${username} joined the room`,
          timestamp: new Date().toISOString()
        });

        console.log(`User ${user.id} joined room ${roomId}`);
      } catch (err) {
        console.error("joinRoom error:", err);
        socket.emit("errorMessage", "Failed to join room");
      }
    });

    socket.on("chatMessage", async ({ token, roomId, text }) => {
      try {
        if (!text || !roomId) return;

        const user = await authUser(token);
        if (!user) return;

        const room = await Room.findOne({ roomId }).populate("admin", "_id");
        if (!room) return;

        const isAdmin = room.admin._id.toString() === user.id.toString();
        const participantsMap = roomParticipants.get(roomId);
        const participant = participantsMap?.get(socket.id);

        const timestamp = new Date().toISOString();
        io.to(roomId).emit("chatMessage", {
          userId: user.id,
          username: participant?.username || (isAdmin ? "Admin" : "User"),
          text,
          timestamp,
          isAdmin
        });
      } catch (err) {
        console.error("chatMessage error:", err);
      }
    });

    socket.on("kickUser", async ({ token, roomId, targetSocketId }) => {
      try {
        const user = await authUser(token);
        if (!user || !roomId || !targetSocketId) return;

        const room = await Room.findOne({ roomId });
        if (!room) return;

        if (room.admin.toString() !== user.id.toString()) return;

        const participantsMap = roomParticipants.get(roomId);
        const kicked = participantsMap?.get(targetSocketId);

        io.to(targetSocketId).emit("kicked");
        io.sockets.sockets.get(targetSocketId)?.leave(roomId);

        if (participantsMap) {
          participantsMap.delete(targetSocketId);
          const participantsList = Array.from(participantsMap.values());
          io.to(roomId).emit("participantsUpdate", participantsList);
        }

        if (kicked) {
          io.to(roomId).emit("systemMessage", {
            text: `${kicked.username} was kicked by admin`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("kickUser error:", err);
      }
    });

    socket.on("dismissRoom", async ({ token, roomId }) => {
      try {
        const user = await authUser(token);
        if (!user || !roomId) return;

        const room = await Room.findOne({ roomId });
        if (!room) return;

        if (room.admin.toString() !== user.id.toString()) return;

        io.to(roomId).emit("roomDismissed");
        await Room.deleteOne({ _id: room._id });
        io.in(roomId).socketsLeave(roomId);

        roomParticipants.delete(roomId);
        console.log(`Room ${roomId} dismissed by admin`);
      } catch (err) {
        console.error("dismissRoom error:", err);
      }
    });

    socket.on("disconnect", () => {
      const { roomId } = socket.data || {};
      if (roomId && roomParticipants.has(roomId)) {
        const participantsMap = roomParticipants.get(roomId);
        participantsMap.delete(socket.id);
        const participantsList = Array.from(participantsMap.values());
        io.to(roomId).emit("participantsUpdate", participantsList);
      }
      console.log("Socket disconnected", socket.id);
    });
  });
};
