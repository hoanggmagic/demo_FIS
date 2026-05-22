import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Style/User/UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    nationality: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(res.data);
    } catch (error) {
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put("http://localhost:8080/api/user/profile", profile, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfileMsg({ text: "✅ Cập nhật thông tin thành công!", ok: true });
    } catch {
      setProfileMsg({ text: "❌ Cập nhật thất bại!", ok: false });
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPassMsg({ text: "❌ Vui lòng nhập đầy đủ thông tin!", ok: false });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({ text: "❌ Mật khẩu xác nhận không khớp!", ok: false });
      return;
    }
    try {
      await axios.put(
        "http://localhost:8080/api/user/profile/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setPassMsg({ text: "✅ Đổi mật khẩu thành công!", ok: true });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPassMsg({
        text:
          error.response?.status === 400
            ? "❌ Mật khẩu hiện tại không đúng!"
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
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name ? profile.name[0].toUpperCase() : "U"}
        </div>
        <div className="profile-header-info">
          <h2 className="profile-header-name">
            {profile.name || "Người dùng"}
          </h2>
          <span className="profile-badge">👤 USER</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Card: Thông tin */}
        <div className="profile-card">
          <h3 className="profile-card-title">👤 Thông tin cá nhân</h3>

          <div className="profile-group">
            <label>Họ tên</label>
            <input
              type="text"
              placeholder="Nhập họ tên"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="profile-group">
            <label>Quốc tịch</label>
            <input
              type="text"
              placeholder="Nhập quốc tịch"
              value={profile.nationality || ""}
              onChange={(e) =>
                setProfile({ ...profile, nationality: e.target.value })
              }
            />
          </div>

          {profileMsg.text && (
            <div
              className={`profile-msg ${profileMsg.ok ? "success" : "error"}`}
            >
              {profileMsg.text}
            </div>
          )}

          <button className="btn-primary" onClick={updateProfile}>
            💾 Lưu thay đổi
          </button>
        </div>

        {/* Card: Đổi mật khẩu */}
        <div className="profile-card">
          <h3 className="profile-card-title">🔒 Đổi mật khẩu</h3>

          <div className="profile-group">
            <label>Mật khẩu hiện tại</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="profile-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="profile-group">
            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>

          {passMsg.text && (
            <div className={`profile-msg ${passMsg.ok ? "success" : "error"}`}>
              {passMsg.text}
            </div>
          )}

          <button className="btn-warning" onClick={changePassword}>
            🔑 Đổi mật khẩu
          </button>

          <hr className="profile-divider" />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
