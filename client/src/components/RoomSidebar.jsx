const RoomSidebar = ({ roomId, roomName, participants, onKick }) => {
  return (
    <aside className="card" style={{ width: 280, height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{roomName}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", wordBreak: "break-all" }}>
          ID: <code>{roomId}</code>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #3730a3", borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#e879f9" }}>
          {participants.length} Online
        </div>
        {participants.map((participant) => (
          <div key={participant.socketId || participant.userId} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "8px 0",
            borderBottom: "1px solid #3730a3"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: 32, height: 32, 
                borderRadius: "50%", 
                background: "#7c3aed", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600
              }}>
                {participant.username.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 14 }}>{participant.username}</span>
            </div>
            <button 
              className="button danger" 
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => onKick(participant.socketId || participant.userId)}
            >
              Kick
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ paddingTop: 8, borderTop: "1px solid #3730a3" }}>
        <button 
          className="button danger" 
          style={{ width: "100%", padding: "12px" }}
          onClick={() => window.confirm("Dismiss room? All data deleted.") && onDismiss()}
        >
          🚨 Dismiss Room
        </button>
      </div>
    </aside>
  );
};

export default RoomSidebar;
