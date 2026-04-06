import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        const decoded = JSON.parse(atob(base64Payload));

        const userData = {
          _id: decoded.id,
          email: decoded.email,
          name: decoded.name,         // ✅ Added
          photo: decoded.photo || "", // ✅ Added
          token: token,
        };

        login(userData);

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);

      } catch (err) {
        console.error("Token decode failed:", err);
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white text-lg">Logging you in...</p>
    </div>
  );
}

export default AuthSuccess;