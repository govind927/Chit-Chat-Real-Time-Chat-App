import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import MessageBubble from "./MessageBubble.jsx";

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatRoom = ({ roomId, onLeave, onDismiss, onKickUser }) => {
  const { socket } = useSocket();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!socket || !token || !roomId) return;

    // Join room
    socket.emit("joinRoom", { token, roomId });

    const handleChatMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          username: msg.username || (msg.userId === user.id ? user.username : "Anonymous")
        }
      ]);
    };

    const handleSystemMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, system: true }]);
    };

    const handleKicked = () => {
      alert("You were kicked from the room by admin.");
      onLeave();
    };

    const handleRoomDismissed = () => {
      alert("Room dismissed by admin. No conversation history stored.");
      onLeave();
    };

    const handleParticipantsUpdate = (participantList) => {
      setParticipants(participantList);
    };

    // Socket event listeners
    socket.on("chatMessage", handleChatMessage);
    socket.on("systemMessage", handleSystemMessage);
    socket.on("kicked", handleKicked);
    socket.on("roomDismissed", handleRoomDismissed);
    socket.on("participantsUpdate", handleParticipantsUpdate);

    return () => {
      socket.off("chatMessage", handleChatMessage);
      socket.off("systemMessage", handleSystemMessage);
      socket.off("kicked", handleKicked);
      socket.off("roomDismissed", handleRoomDismissed);
      socket.off("participantsUpdate", handleParticipantsUpdate);
    };
  }, [socket, token, roomId, user.id, onLeave]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    socket.emit("chatMessage", { token, roomId, text: text.trim() });
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="card" style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      height: "100%" 
    }}>
      {/* Messages container */}
      <div 
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {messages.map((msg, idx) => (
          msg.system ? (
            <div
              key={idx}
              style={{
                alignSelf: "center",
                textAlign: "center",
                fontSize: "12px",
                color: "#9ca3af",
                background: "rgba(156, 163, 175, 0.1)",
                padding: "6px 12px",
                borderRadius: "12px",
                maxWidth: "70%"
              }}
            >
              {msg.text}
            </div>
          ) : (
            <MessageBubble key={idx} msg={msg} />
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(156, 163, 175, 0.2)",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end"
        }}
      >
        <input
          className="input"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, resize: "none" }}
          rows={1}
        />
        <button className="button" type="submit" disabled={!text.trim()}>
          Send
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={onLeave}
          style={{ padding: "10px 16px" }}
        >
          Leave
        </button>
      </form>

      {/* Participants count */}
      {participants.length > 0 && (
        <div style={{
          padding: "0 16px 16px",
          fontSize: "12px",
          color: "#9ca3af"
        }}>
          {participants.length} participant{participants.length !== 1 ? 's' : ''} online
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
