import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Style/Authors/Profile.css";

function Profile() {
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
    biography: "",
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

    if (user.role?.toUpperCase() !== "AUTHOR") {
      navigate("/");
      return;
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/author/profile", {
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
        "http://localhost:8080/api/author/profile/send-reset-otp",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOtpSent(true);
      setPassMsg({ text: "📩 OTP đã gửi về email!", ok: true });
    } catch (err) {
      setPassMsg({ text: "❌ Gửi OTP thất bại!", ok: false });
    } finally {
      setSendingOtp(false);
    }
  };

  // =========================
  // UPDATE PROFILE
  // =========================
  const updateProfile = async () => {
    try {
      await axios.put("http://localhost:8080/api/author/profile", profile, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfileMsg({
        text: "✅ Cập nhật thông tin thành công!",
        ok: true,
      });
    } catch {
      setProfileMsg({ text: "❌ Cập nhật thất bại!", ok: false });
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
        "http://localhost:8080/api/author/profile/change-password",
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

      setPassMsg({ text: "✅ Đổi mật khẩu thành công!", ok: true });

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
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name ? profile.name[0].toUpperCase() : "A"}
        </div>

        <div className="profile-header-info">
          <h2 className="profile-header-name">{profile.name || "Tác giả"}</h2>
          <span className="profile-badge">✍️ AUTHOR</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT - PROFILE */}
        <div className="profile-card">
          <h3>👤 Thông tin cá nhân</h3>

          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Họ tên"
          />

          <input
            value={profile.nationality}
            onChange={(e) =>
              setProfile({ ...profile, nationality: e.target.value })
            }
            placeholder="Quốc tịch"
          />

          <textarea
            value={profile.biography}
            onChange={(e) =>
              setProfile({ ...profile, biography: e.target.value })
            }
            placeholder="Tiểu sử"
          />

          {profileMsg.text && (
            <p className={profileMsg.ok ? "success" : "error"}>
              {profileMsg.text}
            </p>
          )}

          <button onClick={updateProfile}>💾 Lưu</button>
        </div>

        {/* RIGHT - PASSWORD + OTP */}
        <div className="profile-card">
          <h3>🔒 Đổi mật khẩu (OTP)</h3>

          <input
            type="password"
            placeholder="Mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />

          {/* SEND OTP */}
          <button onClick={sendOtp} disabled={sendingOtp}>
            {sendingOtp ? "Đang gửi OTP..." : "📩 Gửi OTP"}
          </button>

          {/* OTP INPUT */}
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
            />
          )}

          {passMsg.text && (
            <p className={passMsg.ok ? "success" : "error"}>{passMsg.text}</p>
          )}

          <button onClick={changePassword}>🔑 Đổi mật khẩu</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
