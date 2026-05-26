import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/users";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const roleColor = (r) =>
  ({ ADMIN: "#9c27b0", AUTHOR: "#1976d2", USER: "#4caf50" })[r] || "#999";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });

  const load = async () => {
    try {
      const res = await axios.get(API, getHeaders());
      setUsers(res.data.filter((u) => u.role === "USER"));
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API, form, getHeaders());
      setMessage("✅ " + res.data.message);
      setForm({ username: "", email: "", fullName: "", password: "" });
      setShowForm(false);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Lỗi tạo user"));
    }
  };

  const handleToggle = async (id, username) => {
    if (!window.confirm(`Khóa/mở khóa tài khoản "${username}"?`)) return;
    try {
      const res = await axios.put(`${API}/${id}/toggle`, {}, getHeaders());
      setMessage("✅ " + res.data.message);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Lỗi"));
    }
  };

  const handleDelete = async (id, username) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn tài khoản "${username}"? Không thể hoàn tác!`,
      )
    )
      return;
    try {
      const res = await axios.delete(`${API}/${id}`, getHeaders());
      setMessage("✅ " + res.data.message);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Lỗi"));
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>👥 Quản lý người dùng</h2>

      {/* Nút mở form */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: 16,
          padding: "10px 20px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {showForm ? "✕ Đóng" : "➕ Thêm user"}
      </button>

      {/* Form thêm user */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#f9f9f9",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>➕ Thêm user mới</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Username *"
              value={form.username}
              required
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Mật khẩu *"
              type="password"
              value={form.password}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✅ Tạo user
          </button>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo username, email, họ tên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
          marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      {message && (
        <p
          style={{
            color: message.includes("✅") ? "green" : "red",
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          {message}
        </p>
      )}

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>ID</th>
            <th style={th}>Username</th>
            <th style={th}>Họ tên</th>
            <th style={th}>Email</th>
            <th style={th}>Trạng thái</th>
            <th style={th}>Ngày tạo</th>
            <th style={th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: 20, color: "#999" }}
              >
                Không có user nào
              </td>
            </tr>
          ) : (
            filtered.map((u) => (
              <tr key={u.id} style={{ opacity: u.active ? 1 : 0.5 }}>
                <td style={td}>{u.id}</td>
                <td style={td}>
                  <strong>{u.username}</strong>
                </td>
                <td style={td}>{u.fullName || "—"}</td>
                <td style={td}>{u.email || "—"}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: u.active ? "#4caf50" : "#e53935",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {u.active ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td style={td}>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleToggle(u.id, u.username)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: u.active ? "#ff9800" : "#4caf50",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      {u.active ? "🔒 Khóa" : "🔓 Mở"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
};
const td = { padding: "10px 12px", borderBottom: "1px solid #eee" };
const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  flex: 1,
};
