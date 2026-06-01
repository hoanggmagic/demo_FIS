import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Style/User/UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    nationality: "",
    avatar: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState({ text: "", ok: true });
  const [passMsg, setPassMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role?.toUpperCase() !== "USER") {
      navigate("/");
      return;
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(res.data);
    } catch (error) {
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND OTP
  // =========================
  const sendOtp = async () => {
    setSendingOtp(true);

    try {
      await axios.post(
        "http://localhost:8080/api/user/profile/send-reset-otp",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOtpSent(true);

      setPassMsg({
        text: "📩 OTP đã gửi về email!",
        ok: true,
      });
    } catch (err) {
      setPassMsg({
        text: "❌ Gửi OTP thất bại!",
        ok: false,
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // =========================
  // UPDATE PROFILE
  // =========================
  const updateProfile = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/user/profile/${profile.id}`,
        {
          email: profile.email,
          fullName: profile.fullName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setProfileMsg({
        text: "✅ Cập nhật thông tin thành công!",
        ok: true,
      });
    } catch {
      setProfileMsg({
        text: "❌ Cập nhật thất bại!",
        ok: false,
      });
    }
  };

  // =========================
  // CHANGE PASSWORD + OTP
  // =========================
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({
        text: "❌ Mật khẩu xác nhận không khớp!",
        ok: false,
      });
      return;
    }

    if (!otpSent) {
      setPassMsg({
        text: "❌ Bạn chưa gửi OTP!",
        ok: false,
      });
      return;
    }

    try {
      await axios.put(
        "http://localhost:8080/api/user/profile/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          otp: passwordData.otp,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setPassMsg({
        text: "✅ Đổi mật khẩu thành công!",
        ok: true,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });

      setOtpSent(false);
    } catch (error) {
      setPassMsg({
        text:
          error.response?.status === 400
            ? "❌ OTP hoặc mật khẩu không đúng!"
            : "❌ Đổi mật khẩu thất bại!",
        ok: false,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <p>Đang tải...</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef2ff 0%,#f5f3ff 40%,#ecfeff 100%)",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* TOP PROFILE */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            padding: "42px",
            marginBottom: 28,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 20px 50px rgba(79,70,229,.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "#818cf820",
              top: -80,
              right: -60,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 42,
                fontWeight: 700,
                boxShadow: "0 10px 30px rgba(99,102,241,.35)",
              }}
            >
              {profile.fullName?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {profile.fullName || "Người dùng"}
              </h1>

              <p
                style={{
                  marginTop: 10,
                  color: "#6b7280",
                  fontSize: 15,
                }}
              >
                Quản lý thông tin tài khoản & bảo mật cá nhân
              </p>

              <div
                style={{
                  marginTop: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#4f46e5",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                👤 USER ACCOUNT
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 26,
          }}
        >
          {/* PROFILE CARD */}
          <div
            style={{
              background: "rgba(255,255,255,.7)",
              backdropFilter: "blur(18px)",
              borderRadius: 30,
              padding: 32,
              border: "1px solid rgba(255,255,255,.5)",
              boxShadow: "0 10px 35px rgba(0,0,0,.06)",
            }}
          >
            <h3
              style={{
                marginBottom: 28,
                fontSize: 24,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              👤 Thông tin cá nhân
            </h3>

            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Họ và tên
              </label>

              <input
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    fullName: e.target.value,
                  })
                }
                placeholder="Nhập họ tên"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: "#f8fafc",
                  fontSize: 15,
                  boxShadow: "inset 0 0 0 1px #e5e7eb",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Quốc tịch
              </label>

              <input
                value={profile.nationality}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    nationality: e.target.value,
                  })
                }
                placeholder="Nhập quốc tịch"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: "#f8fafc",
                  fontSize: 15,
                  boxShadow: "inset 0 0 0 1px #e5e7eb",
                }}
              />
            </div>

            {profileMsg.text && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 18px",
                  borderRadius: 16,
                  background: profileMsg.ok ? "#ecfdf5" : "#fef2f2",
                  color: profileMsg.ok ? "#047857" : "#dc2626",
                  fontWeight: 600,
                }}
              >
                {profileMsg.text}
              </div>
            )}

            <button
              onClick={updateProfile}
              style={{
                width: "100%",
                border: "none",
                padding: "16px",
                borderRadius: 18,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 12px 25px rgba(99,102,241,.3)",
              }}
            >
              💾 Lưu thay đổi
            </button>
          </div>

          {/* PASSWORD CARD */}
          <div
            style={{
              background: "rgba(255,255,255,.7)",
              backdropFilter: "blur(18px)",
              borderRadius: 30,
              padding: 32,
              border: "1px solid rgba(255,255,255,.5)",
              boxShadow: "0 10px 35px rgba(0,0,0,.06)",
            }}
          >
            <h3
              style={{
                marginBottom: 28,
                fontSize: 24,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              🔒 Bảo mật tài khoản
            </h3>

            {[
              {
                key: "currentPassword",
                placeholder: "Mật khẩu hiện tại",
              },
              {
                key: "newPassword",
                placeholder: "Mật khẩu mới",
              },
              {
                key: "confirmPassword",
                placeholder: "Xác nhận mật khẩu",
              },
            ].map((item) => (
              <input
                key={item.key}
                type="password"
                placeholder={item.placeholder}
                value={passwordData[item.key]}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    [item.key]: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: "#f8fafc",
                  fontSize: 15,
                  marginBottom: 16,
                  boxShadow: "inset 0 0 0 1px #e5e7eb",
                }}
              />
            ))}

            <button
              onClick={sendOtp}
              disabled={sendingOtp}
              style={{
                width: "100%",
                border: "none",
                padding: "15px",
                borderRadius: 18,
                background: "linear-gradient(135deg,#f59e0b,#fb7185)",
                color: "#fff",
                fontWeight: 700,
                marginBottom: 18,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(245,158,11,.28)",
              }}
            >
              {sendingOtp ? "Đang gửi OTP..." : "📩 Gửi mã OTP"}
            </button>

            {otpSent && (
              <input
                placeholder="Nhập OTP"
                value={passwordData.otp}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    otp: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: "#f8fafc",
                  fontSize: 15,
                  marginBottom: 18,
                  boxShadow: "inset 0 0 0 1px #e5e7eb",
                }}
              />
            )}

            {passMsg.text && (
              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 18px",
                  borderRadius: 16,
                  background: passMsg.ok ? "#ecfdf5" : "#fef2f2",
                  color: passMsg.ok ? "#047857" : "#dc2626",
                  fontWeight: 600,
                }}
              >
                {passMsg.text}
              </div>
            )}

            <button
              onClick={changePassword}
              style={{
                width: "100%",
                border: "none",
                padding: "16px",
                borderRadius: 18,
                background: "linear-gradient(135deg,#10b981,#06b6d4)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 12px 25px rgba(16,185,129,.28)",
              }}
            >
              🔑 Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
