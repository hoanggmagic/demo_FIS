import { useEffect, useState } from "react";
import axios from "axios";

export default function RegisterAuthor({ goToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    nationality: "",
    biography: "",
    otp: "",
  });
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    let timer;
    if (timeLeft > 0)
      timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    if (timeLeft === 0 && otpSent) {
      setOtpExpired(true);
      setMessage("❌ OTP đã hết hạn");
    }
    return () => clearInterval(timer);
  }, [timeLeft, otpSent]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async () => {
    if (!form.email) {
      setMessage("❌ Vui lòng nhập email");
      return;
    }
    try {
      setSendingOtp(true);
      const res = await axios.post("http://localhost:8080/api/auth/send-otp", {
        email: form.email,
      });
      setMessage("✅ " + res.data);
      setOtpSent(true);
      setTimeLeft(300);
      setOtpExpired(false);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Gửi OTP thất bại"));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpExpired) {
      setMessage("❌ OTP đã hết hạn, vui lòng gửi lại");
      return;
    }
    try {
      setLoadingRegister(true);
      const res = await axios.post(
        "http://localhost:8080/api/auth/register-author",
        form,
      );
      setMessage("✅ " + res.data);
      setTimeout(goToLogin, 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Đăng ký thất bại"));
    } finally {
      setLoadingRegister(false);
    }
  };

  const isSuccess = message.startsWith("✅");

  return (
    <div style={styles.wrapper}>
      <div style={styles.iconBox}>✍️</div>
      <h2 style={styles.title}>Đăng ký Tác giả</h2>
      <p style={styles.sub}>Chia sẻ tác phẩm của bạn với độc giả</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {[
          { k: "username", icon: "👤", ph: "Tên đăng nhập", type: "text" },
          { k: "fullName", icon: "🪪", ph: "Họ và tên", type: "text" },
          { k: "email", icon: "✉️", ph: "Email", type: "email" },
          { k: "nationality", icon: "🌏", ph: "Quốc tịch", type: "text" },
        ].map(({ k, icon, ph, type }) => (
          <div key={k} style={styles.field}>
            <span style={styles.fieldIcon}>{icon}</span>
            <input
              style={styles.input}
              type={type}
              placeholder={ph}
              value={form[k]}
              onChange={set(k)}
              required={k !== "nationality"}
            />
          </div>
        ))}

        <div style={styles.field}>
          <span style={styles.fieldIcon}>🔒</span>
          <input
            style={styles.input}
            type={showPass ? "text" : "password"}
            placeholder="Mật khẩu"
            value={form.password}
            onChange={set("password")}
            required
          />
          <span style={styles.eyeBtn} onClick={() => setShowPass((v) => !v)}>
            {showPass ? "🙈" : "👁️"}
          </span>
        </div>

        <div style={{ ...styles.field, alignItems: "flex-start" }}>
          <span style={{ ...styles.fieldIcon, paddingTop: 12 }}>📖</span>
          <textarea
            style={{
              ...styles.input,
              padding: "12px 8px",
              resize: "vertical",
              minHeight: 80,
            }}
            placeholder="Tiểu sử tác giả (không bắt buộc)"
            value={form.biography}
            onChange={set("biography")}
            rows={3}
          />
        </div>

        {/* OTP */}
        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            style={styles.outlineBtn}
            disabled={sendingOtp}
          >
            {sendingOtp ? "Đang gửi..." : "📨 Gửi mã OTP"}
          </button>
        ) : (
          <>
            <div style={styles.field}>
              <span style={styles.fieldIcon}>🔑</span>
              <input
                style={styles.input}
                type="text"
                placeholder="Nhập mã OTP"
                value={form.otp}
                onChange={set("otp")}
                required
              />
            </div>

            {!otpExpired && (
              <div style={styles.otpTimer}>
                <span>
                  ⏱ Hết hạn sau: <strong>{formatTime(timeLeft)}</strong>
                </span>
                <div style={styles.progressBg}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${(timeLeft / 300) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.btn,
                opacity: loadingRegister || otpExpired ? 0.7 : 1,
              }}
              disabled={loadingRegister || otpExpired}
            >
              {loadingRegister
                ? "Đang đăng ký..."
                : otpExpired
                  ? "OTP đã hết hạn"
                  : "Hoàn tất đăng ký →"}
            </button>

            {otpExpired && (
              <button
                type="button"
                onClick={handleSendOtp}
                style={styles.outlineBtn}
              >
                🔄 Gửi lại OTP
              </button>
            )}
          </>
        )}

        {message && (
          <div
            style={{
              ...styles.msg,
              background: isSuccess ? "#f0fdf4" : "#fef2f2",
              color: isSuccess ? "#16a34a" : "#dc2626",
              border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {message}
          </div>
        )}
      </form>

      <div style={styles.divider}>
        <span>đã có tài khoản?</span>
      </div>
      <button style={styles.linkBtn} onClick={goToLogin}>
        Đăng nhập ngay
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
  eyeBtn: {
    padding: "0 14px",
    cursor: "pointer",
    fontSize: 16,
    userSelect: "none",
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
  outlineBtn: {
    background: "#fff",
    border: "1.5px solid #2563eb",
    color: "#2563eb",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  otpTimer: {
    fontSize: 13,
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  progressBg: {
    width: "100%",
    height: 6,
    background: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb, #38bdf8)",
    borderRadius: 10,
    transition: "width 1s linear",
  },
  msg: { borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500 },
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
