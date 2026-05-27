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
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await getAuthors();
      setAuthors(res.data || []);
    } catch (err) {
      console.error(err);
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

  const handleDelete = async (author) => {
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

  const filtered = authors.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()),
  );

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

      {/* Header row */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              {/* Username / email / password — chỉ khi admin tạo mới */}
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

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-person-badge text-primary" />
            <strong>Danh sách tác giả</strong>
          </span>
          <span className="badge bg-primary">{filtered.length} tác giả</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tên</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Quốc tịch</th>
                  <th>Tiểu sử</th>
                  <th className="text-center">Trạng thái</th>
                  {isAdmin && <th className="text-center">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Không có tác giả nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr
                      key={a.id}
                      style={{ opacity: a.active === false ? 0.55 : 1 }}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#3b7ddd20",
                              color: "#3b7ddd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {a.name?.charAt(0)?.toUpperCase() ?? "A"}
                          </div>
                          <strong>{a.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted">@{a.username}</td>
                      <td>{a.email || "—"}</td>
                      <td>{a.nationality || "—"}</td>
                      <td className="text-muted" style={{ maxWidth: 200 }}>
                        <span title={a.biography}>
                          {a.biography
                            ? a.biography.length > 40
                              ? a.biography.slice(0, 40) + "…"
                              : a.biography
                            : "—"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${a.active === false ? "bg-danger" : "bg-success"}`}
                        >
                          {a.active === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              onClick={() => setEditing(a)}
                            >
                              <i className="bi bi-pencil" /> Sửa
                            </button>
                            <button
                              className={`btn btn-sm d-flex align-items-center gap-1 ${a.active === false ? "btn-outline-success" : "btn-outline-warning"}`}
                              onClick={() => handleDelete(a)}
                            >
                              <i
                                className={`bi ${a.active === false ? "bi-unlock" : "bi-lock"}`}
                              />
                              {a.active === false ? "Mở" : "Vô hiệu"}
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
        </div>
      </div>
    </div>
  );
}
