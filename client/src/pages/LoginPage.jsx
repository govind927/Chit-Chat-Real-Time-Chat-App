import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../components/AuthForm.jsx";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const res = await axiosClient.post("/auth/login", values);
    login(res.data.user, res.data.token);
    navigate("/lobby");
  };

  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <AuthForm mode="login" onSubmit={handleLogin} />
      <div style={{ position: "absolute", bottom: 24, color: "#6b7280" }}>
        New here? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default LoginPage;
