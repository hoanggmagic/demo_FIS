import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/users";
const PAGE_SIZE = 5;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = { username: "", email: "", fullName: "", password: "" };

const AVATAR_COLORS = [
  ["#dbeafe", "#2563eb"],
  ["#dcfce7", "#16a34a"],
  ["#fef3c7", "#d97706"],
  ["#fce7f3", "#db2777"],
  ["#ede9fe", "#7c3aed"],
  ["#ffedd5", "#ea580c"],
  ["#cffafe", "#0891b2"],
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}?page=${page}&size=${PAGE_SIZE}&keyword=${encodeURIComponent(search)}`,
        getHeaders(),
      );
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [search]);
  useEffect(() => {
    load();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(
          `${API}/${editing.id}`,
          { fullName: form.fullName, email: form.email },
          getHeaders(),
        );
        showToast("success", "Cập nhật người dùng thành công!");
      } else {
        await axios.post(API, form, getHeaders());
        showToast("success", "Tạo người dùng thành công!");
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      showToast("danger", err.response?.data || "Lỗi xử lý");
    }
  };

  const handleToggle = async (u) => {
    if (
      !window.confirm(
        `${u.active ? "Khóa" : "Mở khóa"} tài khoản "${u.username}"?`,
      )
    )
      return;
    try {
      await axios.put(`${API}/${u.id}/toggle`, {}, getHeaders());
      showToast("success", `Đã ${u.active ? "khóa" : "mở khóa"} tài khoản!`);
      load();
    } catch {
      showToast("danger", "Lỗi xử lý");
    }
  };

  const handleDelete = async (u) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn tài khoản "${u.username}"? Không thể hoàn tác!`,
      )
    )
      return;
    try {
      await axios.delete(`${API}/${u.id}`, getHeaders());
      showToast("success", "Đã xóa tài khoản!");
      load();
    } catch {
      showToast("danger", "Lỗi xóa tài khoản");
    }
  };

  const handleEditClick = (u) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email || "",
      fullName: u.fullName || "",
      password: "",
    });
    setShowForm(true);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible d-flex align-items-center gap-2 mb-3`}
        >
          <i
            className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
          />
          {toast.msg}
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm người dùng"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {searchInput && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
            >
              ×
            </button>
          )}
          <button className="btn btn-outline-primary" onClick={handleSearch}>
            Tìm
          </button>
        </div>
        <button
          className={`btn ${showForm && !editing ? "btn-secondary" : "btn-primary"} d-flex align-items-center gap-2`}
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm((v) => !v);
          }}
        >
          <i
            className={`bi ${showForm && !editing ? "bi-x-lg" : "bi-person-plus"}`}
          />
          {showForm && !editing ? "Đóng" : "Thêm user"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i
              className={`bi ${editing ? "bi-pencil-square" : "bi-person-plus-fill"} text-primary`}
            />
            <strong>
              {editing ? "Sửa người dùng" : "Thêm người dùng mới"}
            </strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Username{" "}
                    {!editing && <span className="text-danger">*</span>}
                  </label>
                  <input
                    className="form-control"
                    placeholder="username"
                    value={form.username}
                    required={!editing}
                    disabled={!!editing}
                    style={{ background: editing ? "#f8f9fa" : undefined }}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Họ tên</label>
                  <input
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                {!editing && (
                  <div className="col-md-6">
                    <label className="form-label">
                      Mật khẩu <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="••••••"
                      value={form.password}
                      required
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <i className="bi bi-check-lg" />{" "}
                  {editing ? "Lưu thay đổi" : "Tạo tài khoản"}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(null);
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span style={{ fontSize: 14, color: "#64748b" }}>
          <i className="bi bi-people me-1 text-primary" />
          <strong>{totalElements}</strong> người dùng
          {search ? " tìm thấy" : " tổng cộng"}
        </span>
        {totalPages > 1 && (
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Trang {page + 1} / {totalPages}
          </span>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div className="spinner-border spinner-border-sm text-primary me-2" />{" "}
          Đang tải...
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#94a3b8",
          }}
        >
          <i
            className="bi bi-person-x"
            style={{ fontSize: 48, display: "block", marginBottom: 12 }}
          />
          <p style={{ margin: 0 }}>Không tìm thấy người dùng nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {users.map((u, idx) => {
            const [bg, fg] =
              AVATAR_COLORS[(page * PAGE_SIZE + idx) % AVATAR_COLORS.length];
            const initial = (u.fullName || u.username || "U")
              .charAt(0)
              .toUpperCase();
            return (
              <div
                key={u.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #e9ecef",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: u.active ? 1 : 0.6,
                  transition: "box-shadow .18s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,.08)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: bg,
                    color: fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 20,
                    flexShrink: 0,
                    border: `2px solid ${fg}33`,
                  }}
                >
                  {initial}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 3,
                    }}
                  >
                    <strong style={{ fontSize: 15, color: "#0f172a" }}>
                      {u.fullName || "—"}
                    </strong>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      @{u.username}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#64748b",
                        background: "#f1f5f9",
                        borderRadius: 20,
                        padding: "1px 7px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      #{u.id}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 20,
                        padding: "1px 8px",
                        background: u.active ? "#f0fdf4" : "#fef2f2",
                        color: u.active ? "#16a34a" : "#dc2626",
                        border: `1px solid ${u.active ? "#bbf7d0" : "#fecaca"}`,
                      }}
                    >
                      {u.active ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {u.email && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <i
                          className="bi bi-envelope"
                          style={{ fontSize: 11 }}
                        />{" "}
                        {u.email}
                      </span>
                    )}
                    {u.createdAt && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <i
                          className="bi bi-calendar3"
                          style={{ fontSize: 11 }}
                        />
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => handleEditClick(u)}
                  >
                    <i className="bi bi-pencil" /> Sửa
                  </button>
                  <button
                    className={`btn btn-sm d-flex align-items-center gap-1 ${u.active ? "btn-outline-warning" : "btn-outline-success"}`}
                    onClick={() => handleToggle(u)}
                  >
                    <i className={`bi ${u.active ? "bi-lock" : "bi-unlock"}`} />
                    {u.active ? "Khóa" : "Mở"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleDelete(u)}
                  >
                    <i className="bi bi-trash" /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 24,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: "7px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: page === 0 ? "#f8fafc" : "#fff",
              color: page === 0 ? "#cbd5e1" : "#374151",
              cursor: page === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                width: 36,
                height: 36,
                border: i === page ? "none" : "1px solid #e2e8f0",
                borderRadius: 8,
                background:
                  i === page
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "#fff",
                color: i === page ? "#fff" : "#374151",
                cursor: "pointer",
                fontWeight: i === page ? 700 : 400,
                fontSize: 13,
                boxShadow:
                  i === page ? "0 2px 8px rgba(37,99,235,.35)" : "none",
                transition: "all .15s",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              padding: "7px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: page === totalPages - 1 ? "#f8fafc" : "#fff",
              color: page === totalPages - 1 ? "#cbd5e1" : "#374151",
              cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Next ›
          </button>
        </div>
      )}

      {totalElements > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Hiển thị {page * PAGE_SIZE + 1}–
          {Math.min((page + 1) * PAGE_SIZE, totalElements)} / {totalElements}{" "}
          người dùng
        </div>
      )}
    </div>
  );
}
