import { useState } from "react";
import axios from "axios";

export default function ForgotPassword({ goToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8080/api/auth/forgot-password/send-otp",
        { email },
      );
      setMsg("📩 OTP đã gửi");
      setStep(2);
    } catch {
      setMsg("❌ Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/auth/forgot-password/reset", {
        email,
        otp,
        newPassword,
      });
      setMsg("✅ Đổi mật khẩu thành công!");
      setTimeout(() => goToLogin(), 1500); // chờ 1.5s rồi về login
    } catch {
      setMsg("❌ OTP sai hoặc hết hạn");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = msg.startsWith("✅");

  return (
    <div style={styles.wrapper}>
      <div style={styles.iconBox}>🔐</div>
      <h2 style={styles.title}>Quên mật khẩu</h2>
      <p style={styles.sub}>Khôi phục tài khoản</p>

      {step === 1 && (
        <div style={styles.form}>
          <div style={styles.field}>
            <span style={styles.fieldIcon}>📧</span>
            <input
              style={styles.input}
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button style={styles.btn} onClick={sendOtp} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi OTP →"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={styles.form}>
          <div style={styles.field}>
            <span style={styles.fieldIcon}>🔢</span>
            <input
              style={styles.input}
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div style={styles.field}>
            <span style={styles.fieldIcon}>🔒</span>
            <input
              style={styles.input}
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button style={styles.btn} onClick={resetPassword} disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu →"}
          </button>
        </div>
      )}

      {msg && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: isSuccess ? "#f0fdf4" : "#fef2f2",
            color: isSuccess ? "#16a34a" : "#dc2626",
            border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
            width: "100%",
          }}
        >
          {msg}
        </div>
      )}

      <div style={styles.divider}>
        <span>hoặc</span>
      </div>

      {/* NÚT QUAY LẠI — dùng goToLogin prop, không dùng navigate */}
      <button style={styles.linkBtn} onClick={goToLogin}>
        ← Quay lại đăng nhập
      </button>
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
  iconBox: { fontSize: 40, marginBottom: 8 },
  title: {
    margin: "0 0 4px",
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "-0.5px",
  },
  sub: { margin: "0 0 24px", fontSize: 14, color: "#94a3b8" },
  form: { width: "100%", display: "flex", flexDirection: "column", gap: 12 },
  field: {
    display: "flex",
    alignItems: "center",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  fieldIcon: { padding: "0 10px 0 14px", fontSize: 16, userSelect: "none" },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 8px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
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
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
};
