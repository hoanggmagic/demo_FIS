import { useEffect, useState } from "react";
import {
  getAuthors,
  deleteAuthor,
  createAuthor,
  updateAuthor,
} from "../../Api/Admin/authorApi";

const PAGE_SIZE = 5;

const empty = {
  username: "",
  email: "",
  password: "",
  name: "",
  nationality: "",
  biography: "",
};

const AVATAR_COLORS = [
  ["#dbeafe", "#2563eb"],
  ["#dcfce7", "#16a34a"],
  ["#fef3c7", "#d97706"],
  ["#fce7f3", "#db2777"],
  ["#ede9fe", "#7c3aed"],
  ["#ffedd5", "#ea580c"],
  ["#cffafe", "#0891b2"],
];

export default function AuthorManagement({ user }) {
  const [authors, setAuthors] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAuthors(page, PAGE_SIZE, search);
      setAuthors(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page khi search thay đổi
  useEffect(() => {
    setPage(0);
  }, [search]);

  // Load khi page hoặc search thay đổi
  useEffect(() => {
    load();
  }, [page, search]);

  useEffect(() => {
    if (editing) {
      setForm({
        username: editing.username || "",
        email: editing.email || "",
        password: "",
        name: editing.name || editing.fullName || "",
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

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

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
        showToast("success", "Thêm tác giả thành công!");
      } else {
        const id = editing?.id || user.id;
        await updateAuthor(id, {
          name: form.name,
          nationality: form.nationality,
          biography: form.biography,
        });
        showToast("success", "Cập nhật thành công!");
      }
      setForm(empty);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data || "Lưu thất bại");
    }
  };

  const handleToggle = async (author) => {
    const action = author.active === false ? "mở lại" : "vô hiệu hóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tác giả này?`)) return;
    try {
      await deleteAuthor(author.id);
      showToast("success", `Đã ${action} tác giả!`);
      load();
    } catch {
      showToast("danger", "Lỗi xử lý");
    }
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
            placeholder="Tìm theo tên, username, email..."
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
        {isAdmin && (
          <button
            className={`btn ${showForm && !editing ? "btn-secondary" : "btn-primary"} d-flex align-items-center gap-2`}
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
              setError("");
            }}
          >
            <i
              className={`bi ${showForm && !editing ? "bi-x-lg" : "bi-plus-lg"}`}
            />
            {showForm && !editing ? "Đóng" : "Thêm tác giả"}
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || isAuthor) && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i
              className={`bi ${editing ? "bi-pencil-square" : "bi-person-plus"} text-primary`}
            />
            <strong>
              {editing
                ? "Sửa tác giả"
                : isAdmin
                  ? "Thêm tác giả mới"
                  : "Hồ sơ tác giả"}
            </strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {isAdmin && !editing && (
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      placeholder="username"
                      value={form.username}
                      required
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
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
                  <div className="col-md-4">
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
                </div>
              )}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Họ tên <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Quốc tịch</label>
                  <input
                    className="form-control"
                    placeholder="Việt Nam"
                    value={form.nationality}
                    onChange={(e) =>
                      setForm({ ...form, nationality: e.target.value })
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Tiểu sử</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Giới thiệu ngắn về tác giả..."
                    value={form.biography}
                    onChange={(e) =>
                      setForm({ ...form, biography: e.target.value })
                    }
                  />
                </div>
              </div>
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0 py-2">
                  <i className="bi bi-exclamation-triangle-fill" /> {error}
                </div>
              )}
              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <i className="bi bi-check-lg" />{" "}
                  {editing
                    ? "Lưu thay đổi"
                    : isAdmin
                      ? "Thêm tác giả"
                      : "Lưu hồ sơ"}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(null);
                      setShowForm(false);
                      setForm(empty);
                      setError("");
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
          <i className="bi bi-person-badge me-1 text-primary" />
          <strong>{totalElements}</strong> tác giả
          {search ? ` tìm thấy` : " tổng cộng"}
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
      ) : authors.length === 0 ? (
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
          <p style={{ margin: 0 }}>Không tìm thấy tác giả nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {authors.map((a, idx) => {
            const colorIdx = (page * PAGE_SIZE + idx) % AVATAR_COLORS.length;
            const [bg, fg] = AVATAR_COLORS[colorIdx];
            const initial = (a.name || a.fullName || "A")
              .charAt(0)
              .toUpperCase();
            return (
              <div
                key={a.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #e9ecef",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: a.active === false ? 0.6 : 1,
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
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: bg,
                    color: fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 22,
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
                      {a.name || a.fullName}
                    </strong>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      @{a.username}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 20,
                        padding: "1px 8px",
                        background: a.active === false ? "#fef2f2" : "#f0fdf4",
                        color: a.active === false ? "#dc2626" : "#16a34a",
                        border: `1px solid ${a.active === false ? "#fecaca" : "#bbf7d0"}`,
                      }}
                    >
                      {a.active === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap",
                      marginBottom: 5,
                    }}
                  >
                    {a.email && (
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
                        {a.email}
                      </span>
                    )}
                    {a.nationality && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <i className="bi bi-globe" style={{ fontSize: 11 }} />{" "}
                        {a.nationality}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {a.biography || (
                      <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>
                        Chưa có tiểu sử
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={() => setEditing(a)}
                    >
                      <i className="bi bi-pencil" /> Sửa
                    </button>
                    <button
                      className={`btn btn-sm d-flex align-items-center gap-1 ${a.active === false ? "btn-outline-success" : "btn-outline-warning"}`}
                      onClick={() => handleToggle(a)}
                    >
                      <i
                        className={`bi ${a.active === false ? "bi-unlock" : "bi-lock"}`}
                      />
                      {a.active === false ? "Mở" : "Vô hiệu"}
                    </button>
                  </div>
                )}
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
          tác giả
        </div>
      )}
    </div>
  );
}
