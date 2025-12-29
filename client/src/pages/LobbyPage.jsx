import { useState } from "react";
import axiosClient from "../api/axiosClient.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const LobbyPage = () => {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = async (e) => {
    e.preventDefault();
    const res = await axiosClient.post("/rooms/create", { name: roomName });
    navigate(`/chat/${res.data.roomId}`, {
      state: { isAdmin: true, roomName: res.data.name }
    });
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    const res = await axiosClient.post("/rooms/join", { roomId });
    navigate(`/chat/${res.data.roomId}`, {
      state: { isAdmin: res.data.isAdmin, roomName: res.data.name }
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: 24
        }}
      >
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <form
            onSubmit={createRoom}
            className="card"
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3>Create a room</h3>
            <input
              className="input"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button className="button" style={{ marginTop: 12 }}>
              Create
            </button>
          </form>

          <form
            onSubmit={joinRoom}
            className="card"
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3>Join with room ID</h3>
            <input
              className="input"
              placeholder="8-character Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="button" style={{ marginTop: 12 }}>
              Join
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;
