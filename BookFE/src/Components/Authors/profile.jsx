import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    nationality: "",
    biography: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);

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
      console.log(error);

      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put("http://localhost:8080/api/author/profile", profile, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.log(error);
      alert("Cập nhật thất bại!");
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await axios.put(
        "http://localhost:8080/api/author/change-password",
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

      alert("Đổi mật khẩu thành công!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);

      if (error.response?.status === 400) {
        alert("Mật khẩu hiện tại không đúng!");
      } else {
        alert("Đổi mật khẩu thất bại!");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="container mt-4">
      <h3>Profile</h3>

      <div className="mb-3">
        <label>Name</label>

        <input
          type="text"
          className="form-control"
          value={profile.name || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              name: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label>Nationality</label>

        <input
          type="text"
          className="form-control"
          value={profile.nationality || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              nationality: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label>Biography</label>

        <textarea
          rows="5"
          className="form-control"
          value={profile.biography || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              biography: e.target.value,
            })
          }
        />
      </div>

      <button className="btn btn-primary mb-4" onClick={updateProfile}>
        Update Profile
      </button>

      <hr />

      <h3>Change Password</h3>

      <div className="mb-3">
        <label>Current Password</label>

        <input
          type="password"
          className="form-control"
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              currentPassword: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label>New Password</label>

        <input
          type="password"
          className="form-control"
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              newPassword: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label>Confirm New Password</label>

        <input
          type="password"
          className="form-control"
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
        />
      </div>

      <button className="btn btn-warning" onClick={changePassword}>
        Change Password
      </button>
    </div>
  );
}

export default Profile;
