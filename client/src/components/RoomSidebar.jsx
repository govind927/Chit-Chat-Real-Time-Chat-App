const RoomSidebar = ({
  roomId,
  roomName,
  isAdmin,
  participants,
  onDismiss,
  onKick
}) => {
  return (
    <aside
      className="card"
      style={{
        width: 260,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{roomName}</div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Room ID: {roomId}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 13, marginBottom: 8, color: "#9ca3af" }}>
          Participants
        </div>
        {participants.map((p) => (
          <div
            key={p.socketId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6
            }}
          >
            <span style={{ fontSize: 14 }}>
              {p.isAdmin ? "Admin" : "User"}: {p.username}
            </span>
            {isAdmin && !p.isAdmin && (
              <button
                className="button danger"
                style={{ padding: "4px 8px", fontSize: 11 }}
                onClick={() => onKick(p.socketId)}
              >
                Kick
              </button>
            )}
          </div>
        ))}
      </div>
      {isAdmin && (
        <button className="button danger" onClick={onDismiss}>
          Dismiss room
        </button>
      )}
    </aside>
  );
};

export default RoomSidebar;
