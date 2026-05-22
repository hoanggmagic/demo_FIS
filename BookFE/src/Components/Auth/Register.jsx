import { useEffect, useState } from "react";
import axios from "axios";

export default function Register({ goToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    otp: "",
  });

  const [message, setMessage] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);

  const [loadingRegister, setLoadingRegister] = useState(false);

  // countdown
  const [timeLeft, setTimeLeft] = useState(0);

  const [otpExpired, setOtpExpired] = useState(false);

  // format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // chạy countdown
  useEffect(() => {
    let timer;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    // hết hạn
    if (timeLeft === 0 && otpSent) {
      setOtpExpired(true);
      setMessage("❌ OTP của bạn đã hết hạn");
    }

    return () => clearInterval(timer);
  }, [timeLeft, otpSent]);

  // gửi otp
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

      // hiện ô OTP
      setOtpSent(true);

      // reset countdown 5 phút
      setTimeLeft(300);

      setOtpExpired(false);
    } catch (err) {
      console.log(err);

      setMessage("❌ " + (err.response?.data || "Gửi OTP thất bại"));
    } finally {
      setSendingOtp(false);
    }
  };

  // đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    // otp hết hạn
    if (otpExpired) {
      setMessage("❌ OTP đã hết hạn, vui lòng gửi lại");
      return;
    }

    try {
      setLoadingRegister(true);

      const res = await axios.post("http://localhost:8080/api/auth/register", {
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        otp: form.otp,
        role: "USER",
      });

      setMessage("✅ " + res.data);

      setTimeout(() => {
        goToLogin();
      }, 1500);
    } catch (err) {
      console.log(err);

      setMessage("❌ " + (err.response?.data || "Đăng ký thất bại"));
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>📝 Đăng ký</h2>

        {/* username */}
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

        {/* fullname */}
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

        {/* email */}
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

        {/* password */}
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

        {/* gửi otp */}
        {!otpSent && (
          <button type="button" onClick={handleSendOtp} className="btn-primary">
            {sendingOtp ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
        )}

        {/* nhập otp sau khi gửi */}
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Nhập OTP"
              value={form.otp}
              onChange={(e) =>
                setForm({
                  ...form,
                  otp: e.target.value,
                })
              }
              required
            />

            {/* countdown */}
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

            {/* thanh progress */}
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

            {/* gửi lại */}
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

        {/* message */}
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

        {/* login */}
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
