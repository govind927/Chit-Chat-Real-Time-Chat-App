import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid #111827"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            background: "#4c1d95",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18
          }}
        >
          💬
        </span>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Chit-Chat</span>
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "#9ca3af" }}>
            {user.username}
          </span>
          <button className="button secondary" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
