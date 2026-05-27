import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/users";
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = { username: "", email: "", fullName: "", password: "" };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await axios.get(API, getHeaders());
      setUsers(res.data.filter((u) => u.role === "USER"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
    setForm(emptyForm);
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Tìm theo username, email, họ tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    style={{ background: editing ? "#f8f9fa" : undefined }}
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
                    onClick={handleCancel}
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
            <i className="bi bi-people text-primary" />
            <strong>Danh sách người dùng</strong>
          </span>
          <span className="badge bg-primary">{filtered.length} người dùng</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th className="text-center">Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                      <td className="text-muted" style={{ width: 60 }}>
                        #{u.id}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 34,
                              height: 34,
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
                            {(u.fullName || u.username)
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>
                              {u.fullName || "—"}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email || "—"}</td>
                      <td className="text-center">
                        <span
                          className={`badge ${u.active ? "bg-success" : "bg-danger"}`}
                        >
                          {u.active ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
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
                            <i
                              className={`bi ${u.active ? "bi-lock" : "bi-unlock"}`}
                            />
                            {u.active ? "Khóa" : "Mở"}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleDelete(u)}
                          >
                            <i className="bi bi-trash" /> Xóa
                          </button>
                        </div>
                      </td>
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
