import { useState } from "react";
import { login } from "../../Api/Auth/authApi";
import { useNavigate } from "react-router-dom";

export default function Login({ onSuccess, goToRegister, goToRegisterAuthor }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.username, form.password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const user = res.data.user;
      onSuccess(user);
      const role = user.role?.toUpperCase();
      if (role === "ADMIN") navigate("/");
      else if (role === "AUTHOR") navigate("/author/books");
    } catch (err) {
      const data = err.response?.data;
      let message = "Sai tên đăng nhập hoặc mật khẩu";
      if (data?.code === "ACCOUNT_INACTIVE")
        message = "Tài khoản đã bị ngừng hoạt động";
      else if (data?.message) message = data.message;
      setError(message);
      setTimeout(() => setError(""), 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.iconBox}>📚</div>
      <h2 style={styles.title}>Đăng nhập</h2>
      <p style={styles.sub}>Chào mừng trở lại!</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <span style={styles.fieldIcon}>👤</span>
          <input
            style={styles.input}
            type="text"
            placeholder="Tên đăng nhập"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div style={styles.field}>
          <span style={styles.fieldIcon}>🔒</span>
          <input
            style={styles.input}
            type={showPass ? "text" : "password"}
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <span style={styles.eyeBtn} onClick={() => setShowPass((v) => !v)}>
            {showPass ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <button
          type="submit"
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
        </button>
      </form>

      <div style={styles.divider}>
        <span>hoặc</span>
      </div>

      <div style={styles.links}>
        <button style={styles.linkBtn} onClick={goToRegister}>
          Tạo tài khoản mới
        </button>
        <span style={{ color: "#cbd5e1" }}>·</span>
        <button style={styles.linkBtn} onClick={goToRegisterAuthor}>
          Đăng ký tác giả
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "8px 4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 320,
  },
  iconBox: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    margin: "0 0 4px",
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "-0.5px",
  },
  sub: {
    margin: "0 0 24px",
    fontSize: 14,
    color: "#94a3b8",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  field: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    transition: "border-color .2s",
  },
  fieldIcon: {
    padding: "0 10px 0 14px",
    fontSize: 16,
    userSelect: "none",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 8px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
  },
  eyeBtn: {
    padding: "0 14px",
    cursor: "pointer",
    fontSize: 16,
    userSelect: "none",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
  },
  btn: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.3px",
    marginTop: 4,
    transition: "transform .1s",
  },
  divider: {
    width: "100%",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
    marginTop: 20,
    paddingTop: 16,
    fontSize: 12,
    color: "#94a3b8",
  },
  links: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginTop: 12,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
};
