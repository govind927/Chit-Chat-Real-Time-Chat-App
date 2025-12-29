import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import RoomSidebar from "../components/RoomSidebar.jsx";
import ChatRoom from "../components/ChatRoom.jsx";
import axiosClient from "../api/axiosClient.js";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ChatPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { token, user } = useAuth();

  const [roomName, setRoomName] = useState(location.state?.roomName || "");
  const [isAdmin, setIsAdmin] = useState(location.state?.isAdmin || false);
  const [participants, setParticipants] = useState([]);

  // Fetch room info on mount/refresh
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await axiosClient.post("/rooms/join", { roomId });
        setRoomName(res.data.name);
        setIsAdmin(res.data.isAdmin);
      } catch (err) {
        console.error("Failed to fetch room info:", err);
        navigate("/lobby");
      }
    };

    if (!roomName) {
      fetchRoomInfo();
    }
  }, [roomId, roomName, navigate]);

  // Socket logic for participants + real-time updates
  useEffect(() => {
    if (!socket || !token || !roomId || !user?.username) return;

    // Join room with username
    socket.emit("joinRoom", { 
      token, 
      roomId, 
      username: user.username 
    });

    const handleParticipantsUpdate = (participantList) => {
      console.log("Participants updated:", participantList);
      setParticipants(participantList);
    };

    const handleKicked = () => {
      alert("You were kicked from the room by admin!");
      navigate("/lobby");
    };

    const handleChatMessage = (msg) => {
      // Messages handled in ChatRoom component
    };

    const handleSystemMessage = (msg) => {
      // System messages handled in ChatRoom
    };

    // Socket event listeners
    socket.on("participantsUpdate", handleParticipantsUpdate);
    socket.on("kicked", handleKicked);
    socket.on("chatMessage", handleChatMessage);
    socket.on("systemMessage", handleSystemMessage);

    return () => {
      socket.off("participantsUpdate", handleParticipantsUpdate);
      socket.off("kicked", handleKicked);
      socket.off("chatMessage", handleChatMessage);
      socket.off("systemMessage", handleSystemMessage);
    };
  }, [socket, token, roomId, user?.username, navigate]);

  const handleLeave = async () => {
    try {
      await axiosClient.post("/rooms/leave", { roomId });
    } catch (err) {
      console.error("Leave room error:", err);
    }
    navigate("/lobby");
  };

  const handleDismiss = async () => {
    if (!confirm("Dismiss room? All data will be permanently deleted!")) return;
    
    try {
      await axiosClient.post("/rooms/dismiss", { roomId });
      if (socket) socket.emit("dismissRoom", { token, roomId });
      navigate("/lobby");
    } catch (err) {
      console.error("Dismiss room error:", err);
      alert("Error dismissing room");
    }
  };

  const handleKickUser = (targetSocketId) => {
    if (!socket || !targetSocketId) return;
    
    console.log("Kicking user:", targetSocketId);
    socket.emit("kickUser", { targetSocketId });
  };

  // Don't render until socket is ready and we have room info
  if (!roomName || participants.length === 0) {
    return (
      <div className="app-container" style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "#050510"
      }}>
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Joining room...</div>
          <div style={{ fontSize: 14 }}>Room ID: {roomId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="chat-layout" style={{ padding: 16, gap: 16 }}>
        <RoomSidebar
          roomId={roomId}
          roomName={roomName}
          participants={participants}
          isAdmin={isAdmin}
          onDismiss={handleDismiss}
          onKick={handleKickUser}
        />
        <ChatRoom
          roomId={roomId}
          participants={participants}  // Pass to ChatRoom for count
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
};

export default ChatPage;
