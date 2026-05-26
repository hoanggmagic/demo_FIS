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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    if (timeLeft === 0 && otpSent) {
      setOtpExpired(true);
      setMessage("❌ OTP của bạn đã hết hạn");
    }
    return () => clearInterval(timer);
  }, [timeLeft, otpSent]);

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
        "http://localhost:8080/api/auth/register-author", // ← endpoint khác
        {
          username: form.username,
          email: form.email,
          fullName: form.fullName,
          password: form.password,
          nationality: form.nationality,
          biography: form.biography,
          otp: form.otp,
        },
      );
      setMessage("✅ " + res.data);
      setTimeout(() => goToLogin(), 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Đăng ký thất bại"));
    } finally {
      setLoadingRegister(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>✍️ Đăng ký Tác giả</h2>

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={set("username")}
          required
        />
        <input
          type="text"
          placeholder="Họ tên"
          value={form.fullName}
          onChange={set("fullName")}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={set("email")}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={set("password")}
          required
        />

        {/* Thêm 2 field riêng cho author */}
        <input
          type="text"
          placeholder="Quốc tịch"
          value={form.nationality}
          onChange={set("nationality")}
        />
        <textarea
          placeholder="Tiểu sử tác giả"
          value={form.biography}
          onChange={set("biography")}
          rows={3}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            resize: "vertical",
          }}
        />

        {!otpSent && (
          <button type="button" onClick={handleSendOtp} className="btn-primary">
            {sendingOtp ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
        )}

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Nhập OTP"
              value={form.otp}
              onChange={set("otp")}
              required
            />

            {!otpExpired && (
              <div
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#ff9800",
                }}
              >
                OTP hết hạn sau: {formatTime(timeLeft)}
              </div>
            )}

            {!otpExpired && (
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "#ddd",
                  borderRadius: "10px",
                  marginTop: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(timeLeft / 300) * 100}%`,
                    height: "100%",
                    background: "#4caf50",
                    transition: "1s linear",
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loadingRegister || otpExpired}
            >
              {loadingRegister
                ? "Đang đăng ký..."
                : otpExpired
                  ? "OTP đã hết hạn"
                  : "Xác nhận đăng ký"}
            </button>

            {otpExpired && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="btn-primary"
                style={{ marginTop: "10px" }}
              >
                Gửi lại OTP
              </button>
            )}
          </>
        )}

        {message && (
          <p
            style={{
              color: message.includes("✅") ? "green" : "red",
              textAlign: "center",
              marginTop: "10px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Đã có tài khoản?{" "}
          <span
            onClick={goToLogin}
            style={{ color: "#1976d2", cursor: "pointer", fontWeight: "bold" }}
          >
            Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}
