import { useState } from "react";
import { login } from "../../Api/Auth/authApi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Login({ onSuccess, goToRegister }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await login(form.username, form.password);

      localStorage.setItem("token", res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      const user = res.data.user;

      console.log("USER:", user);

      onSuccess(user);

      // Role redirect
      const role = user.role?.toUpperCase();

      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "AUTHOR") {
        navigate("/author/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      const data = err.response?.data;

      const code = data?.code;

      let message = "Sai tên đăng nhập hoặc mật khẩu";

      if (code === "ACCOUNT_INACTIVE") {
        message = "Tài khoản của bạn đã bị ngừng hoạt động";
      } else if (data?.message) {
        message = data.message;
      }

      setError(message);

      setTimeout(() => {
        setError("");
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>🔐 Đăng nhập</h2>

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p>
          Chưa có tài khoản?{" "}
          <button type="button" onClick={goToRegister}>
            Đăng ký
          </button>
        </p>
      </form>
    </div>
  );
}
