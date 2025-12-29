import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../components/AuthForm.jsx";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    const res = await axiosClient.post("/auth/register", values);
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
      <AuthForm mode="register" onSubmit={handleRegister} />
      <div style={{ position: "absolute", bottom: 24, color: "#6b7280" }}>
        Already registered? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
