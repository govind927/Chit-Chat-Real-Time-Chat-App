import { useAuth } from "../context/AuthContext.jsx";

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageBubble = ({ msg }) => {
  const { user } = useAuth();
  const isSelf = msg.userId === user.id;
  const labelPrefix = msg.isAdmin ? "Admin" : "User";

  return (
    <div className={`message-row ${isSelf ? "self" : ""}`}>
      <div className={`message-bubble ${isSelf ? "self" : ""}`}>
        <div className="username-label">
          {labelPrefix}: {msg.username}
        </div>
        <div>{msg.text}</div>
        <div className="message-meta">{formatTime(msg.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
