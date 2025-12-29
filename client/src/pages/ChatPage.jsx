import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import RoomSidebar from "../components/RoomSidebar.jsx";
import ChatRoom from "../components/ChatRoom.jsx";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const ChatPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

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

  const handleLeave = async () => {
    try {
      await axiosClient.post("/rooms/leave", { roomId });
    } catch (err) {
      console.error("Leave room error:", err);
    }
    navigate("/lobby");
  };

  const handleDismiss = async () => {
    try {
      await axiosClient.post("/rooms/dismiss", { roomId });
      navigate("/lobby");
    } catch (err) {
      console.error("Dismiss room error:", err);
    }
  };

  const handleKickUser = (targetSocketId) => {
    // Socket kick logic handled in ChatRoom component
    console.log("Kick user:", targetSocketId);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="chat-layout" style={{ padding: 16, gap: 16 }}>
        <RoomSidebar
          roomId={roomId}
          roomName={roomName}
          isAdmin={isAdmin}
          participants={participants}
          onDismiss={handleDismiss}
          onKick={handleKickUser}
        />
        <ChatRoom
          roomId={roomId}
          onLeave={handleLeave}
          onDismiss={handleDismiss}
          onKickUser={handleKickUser}
        />
      </div>
    </div>
  );
};

export default ChatPage;
