import { useState } from "react";
import axios from "axios";

export default function Register({ goToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        role: "USER",
      });

      setMessage("✅ Đăng ký thành công!");

      setTimeout(() => {
        goToLogin();
      }, 1500);
    } catch (err) {
      console.log("FULL ERROR:", err);

      console.log("RESPONSE:", err.response);

      console.log("DATA:", err.response?.data);

      if (err.response?.data) {
        setMessage("❌ " + JSON.stringify(err.response.data));
      } else {
        setMessage("❌ Không kết nối được server");
      }
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>📝 Đăng ký</h2>

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
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Họ tên"
          value={form.fullName}
          onChange={(e) =>
            setForm({
              ...form,
              fullName: e.target.value,
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

        {message && (
          <p
            style={{
              color: message.includes("thành công") ? "green" : "red",
              textAlign: "center",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" className="btn-primary">
          Đăng ký
        </button>

        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          Đã có tài khoản?{" "}
          <span
            onClick={goToLogin}
            style={{
              color: "#1976d2",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}
