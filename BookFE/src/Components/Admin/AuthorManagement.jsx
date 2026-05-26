import { useEffect, useState } from "react";
import {
  getAuthors,
  deleteAuthor,
  createAuthor,
  updateAuthor,
} from "../../Api/Admin/authorApi";

const empty = {
  username: "",
  email: "",
  password: "",
  name: "",
  nationality: "",
  biography: "",
};

export default function AuthorManagement({ user }) {
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  const load = async () => {
    try {
      const res = await getAuthors();
      setAuthors(res.data || []);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        username: editing.username || "",
        email: editing.email || "",
        password: "",
        name: editing.name || "",
        nationality: editing.nationality || "",
        biography: editing.biography || "",
      });
      setShowForm(true);
    } else if (isAuthor && user && !editing) {
      setForm({
        username: user.username,
        email: user.email || "",
        password: "",
        name: user.fullName || "",
        nationality: user.nationality || "",
        biography: user.biography || "",
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isAdmin && !editing) {
        if (!form.username || !form.password || !form.name) {
          setError("Username, mật khẩu và họ tên là bắt buộc");
          return;
        }
        await createAuthor(form);
        setMessage("✅ Thêm tác giả thành công!");
      } else {
        const id = editing?.id || user.id;
        await updateAuthor(id, {
          name: form.name,
          nationality: form.nationality,
          biography: form.biography,
        });
        setMessage("✅ Cập nhật thành công!");
      }
      setForm(empty);
      setEditing(null);
      setShowForm(false);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Lưu thất bại");
    }
  };

  const handleDelete = async (author) => {
    const action = author.active === false ? "mở lại" : "vô hiệu hóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tác giả này?`)) return;
    try {
      await deleteAuthor(author.id);
      setMessage(`✅ Đã ${action} tác giả!`);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Lỗi xử lý");
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setShowForm(false);
    setForm(empty);
    setError("");
  };

  const filtered = authors.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>✍️ Quản lý tác giả</h2>

      {/* Nút mở form */}
      {isAdmin && (
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
            setError("");
          }}
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
          {showForm && !editing ? "✕ Đóng" : "➕ Thêm tác giả"}
        </button>
      )}

      {/* Form */}
      {(showForm || isAuthor) && (
        <form
          onSubmit={handleSubmit}
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
          <h3 style={{ margin: 0 }}>
            {editing
              ? "✏️ Sửa tác giả"
              : isAdmin
                ? "➕ Thêm tác giả"
                : "✏️ Hồ sơ tác giả"}
          </h3>

          {isAdmin && !editing && (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Username *"
                value={form.username}
                required
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={inputStyle}
              />
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
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Họ tên *"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Quốc tịch"
              value={form.nationality}
              onChange={(e) =>
                setForm({ ...form, nationality: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <textarea
            placeholder="Tiểu sử"
            value={form.biography}
            rows={2}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✅ Lưu
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: "10px 20px",
                  background: "#999",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo tên, username, email..."
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
            <th style={th}>Tên</th>
            <th style={th}>Username</th>
            <th style={th}>Email</th>
            <th style={th}>Quốc tịch</th>
            <th style={th}>Tiểu sử</th>
            <th style={th}>Trạng thái</th>
            {isAdmin && <th style={th}>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{ textAlign: "center", padding: 20, color: "#999" }}
              >
                Không có tác giả nào
              </td>
            </tr>
          ) : (
            filtered.map((a) => (
              <tr key={a.id} style={{ opacity: a.active === false ? 0.5 : 1 }}>
                <td style={td}>
                  <strong>{a.name}</strong>
                </td>
                <td style={td}>@{a.username}</td>
                <td style={td}>{a.email || "—"}</td>
                <td style={td}>{a.nationality || "—"}</td>
                <td style={td} title={a.biography}>
                  {a.biography
                    ? a.biography.length > 40
                      ? a.biography.slice(0, 40) + "..."
                      : a.biography
                    : "—"}
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#fff",
                      background: a.active === false ? "#e53935" : "#4caf50",
                    }}
                  >
                    {a.active === false ? "INACTIVE" : "ACTIVE"}
                  </span>
                </td>
                {isAdmin && (
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditing(a)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          background: "#1976d2",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          background:
                            a.active === false ? "#4caf50" : "#ff9800",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        {a.active === false ? "🔓 Mở" : "🔒 Vô hiệu"}
                      </button>
                    </div>
                  </td>
                )}
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
