import { useState } from "react";

const AuthForm = ({ mode, onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handle = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handle} className="card" style={{ maxWidth: 360, width: "100%" }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="button" type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
