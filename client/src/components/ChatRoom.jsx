import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import MessageBubble from "./MessageBubble.jsx";

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatRoom = ({
  roomId,
  isAdmin,
  onLeave,
  onDismiss,
  onKickUser,
  onParticipantsChange,
}) => {
  const { socket } = useSocket();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [roomClosed, setRoomClosed] = useState(false);
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 1) Only join the room
  useEffect(() => {
    if (!socket || !token || !roomId) return;
    socket.emit("joinRoom", { token, roomId });
  }, [socket, token, roomId]);

  // 2) Set up listeners
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleSystemMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, system: true }]);
    };

    const handleRoomDismissed = (data) => {
      const message =
        data?.message ||
        "Room dismissed by admin. No conversation history stored.";
      const timestamp = data?.timestamp || new Date().toISOString();

      setRoomClosed(true);
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          system: true,
          timestamp,
          roomClosed: true,
        },
      ]);

      alert(message);
      setTimeout(() => onLeave(), 2000);
    };

    const handleKicked = () => {
      alert("You were kicked from the room by admin!");
      onLeave();
    };

    const handleParticipantsUpdate = (participantList) => {
      setParticipants(participantList);
      onParticipantsChange?.(participantList);
    };

    const handleJoinedRoom = (data) => {
      const list = data?.participants || [];
      setParticipants(list);
      onParticipantsChange?.(list);
    };

    const handleErrorMessage = (msg) => {
      alert(msg || "Failed to join room");
      onLeave();
    };

    socket.on("chatMessage", handleChatMessage);
    socket.on("systemMessage", handleSystemMessage);
    socket.on("roomDismissed", handleRoomDismissed);
    socket.on("kicked", handleKicked);
    socket.on("participantsUpdate", handleParticipantsUpdate);
    socket.on("joinedRoom", handleJoinedRoom);
    socket.on("errorMessage", handleErrorMessage);

    return () => {
      socket.off("chatMessage", handleChatMessage);
      socket.off("systemMessage", handleSystemMessage);
      socket.off("roomDismissed", handleRoomDismissed);
      socket.off("kicked", handleKicked);
      socket.off("participantsUpdate", handleParticipantsUpdate);
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("errorMessage", handleErrorMessage);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || roomClosed) return;

    socket.emit("chatMessage", { token, roomId, text: text.trim() });
    setText("");
  };

  if (roomClosed) {
    return (
      <div
        className="card"
        style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          🚫 Room closed by admin
        </div>
        <button className="button" onClick={onLeave} style={{ margin: 16 }}>
          Return to Lobby
        </button>
      </div>
    );
  }

  const participantsCount = participants.length || 0;

  return (
    <div
      className="card"
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Header with participant count */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(156, 163, 175, 0.2)",
          fontSize: 14,
          color: "#9ca3af",
        }}
      >
        {participantsCount} participant{participantsCount !== 1 ? "s" : ""} online
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, idx) =>
          msg.system ? (
            <div
              key={idx}
              style={{
                alignSelf: "center",
                textAlign: "center",
                fontSize: "13px",
                color: msg.roomClosed ? "#ef4444" : "#9ca3af",
                background: "rgba(156, 163, 175, 0.1)",
                padding: "8px 16px",
                borderRadius: "12px",
                maxWidth: "80%",
              }}
            >
              {msg.text}
              {msg.timestamp && (
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          ) : (
            <MessageBubble key={idx} msg={msg} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + controls */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(156, 163, 175, 0.2)",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
        }}
      >
        <input
          className="input"
          placeholder={roomClosed ? "Room closed by admin" : "Type your message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={roomClosed}
          style={{
            flex: 1,
            background: roomClosed ? "#1e1b4b" : "transparent",
            opacity: roomClosed ? 0.5 : 1,
          }}
        />
        <button
          className="button"
          type="submit"
          disabled={!text.trim() || roomClosed}
          style={{ opacity: roomClosed ? 0.5 : 1 }}
        >
          {roomClosed ? "Closed" : "Send"}
        </button>
        <button className="button secondary" type="button" onClick={onLeave}>
          Leave
        </button>
        {isAdmin && (
          <button
            className="button danger"
            type="button"
            onClick={onDismiss}
            style={{ marginLeft: 8 }}
          >
            Dismiss room
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatRoom;
