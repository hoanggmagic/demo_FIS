import { useEffect, useState } from "react";
import {
  getBranches,
  createBranch,
  updateBranch,
  toggleBranchStatus,
} from "../../Api/Admin/BranchApi";

const empty = { name: "", address: "", phone: "" };

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await getBranches();
      setBranches(res.data || []);
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
        name: editing.name || "",
        address: editing.address || "",
        phone: editing.phone || "",
      });
      setShowForm(true);
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Tên chi nhánh không được trống");
      return;
    }
    try {
      if (editing) {
        await updateBranch(editing.id, form);
        showToast("success", "Cập nhật chi nhánh thành công!");
      } else {
        await createBranch(form);
        showToast("success", "Thêm chi nhánh thành công!");
      }
      setForm(empty);
      setEditing(null);
      setShowForm(false);
      setError("");
      load();
    } catch (err) {
      setError(err.response?.data || "Lưu thất bại");
    }
  };

  const handleToggle = async (id, name, currentStatus) => {
    const action = currentStatus === "active" ? "vô hiệu hóa" : "kích hoạt";
    if (!window.confirm(`Bạn muốn ${action} chi nhánh "${name}"?`)) return;
    try {
      const res = await toggleBranchStatus(id);
      showToast("success", res.data.message);
      load();
    } catch (err) {
      showToast("danger", err.response?.data || "Thao tác thất bại");
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type} d-flex align-items-center gap-2`}
          style={{ marginBottom: 20 }}
        >
          <i
            className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
          />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted" style={{ fontSize: 14 }}>
          Quản lý danh sách chi nhánh
        </span>
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
          {showForm && !editing ? "Đóng" : "Thêm chi nhánh"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i
              className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} text-primary`}
            />
            <strong>{editing ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Tên chi nhánh <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: Chi nhánh Hà Nội"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Địa chỉ chi nhánh"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0xxxxxxxxx"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
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
                  <i className="bi bi-check-lg" />
                  {editing ? "Lưu thay đổi" : "Thêm chi nhánh"}
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
            <i className="bi bi-shop text-primary" />
            <strong>Danh sách chi nhánh</strong>
          </span>
          <span className="badge bg-primary">{branches.length} chi nhánh</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tên chi nhánh</th>
                  <th>Địa chỉ</th>
                  <th>Số điện thoại</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Hành động</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Chưa có chi nhánh nào
                    </td>
                  </tr>
                ) : (
                  branches.map((b) => (
                    <tr key={b.id}>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        #{b.id}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${b.status === "active" ? "bg-success" : "bg-secondary"}`}
                        >
                          {b.status === "active"
                            ? "Đang hoạt động"
                            : "Đang dừng hoạt động"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="bi bi-shop"
                              style={{ color: "#2563eb" }}
                            />
                          </div>
                          <strong>{b.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted">{b.address || "—"}</td>
                      <td className="text-muted">{b.phone || "—"}</td>
                      <td style={{ fontSize: 13 }}>
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => setEditing(b)}
                          >
                            <i className="bi bi-pencil" /> Sửa
                          </button>
                          <button
                            className={`btn btn-sm d-flex align-items-center gap-1 ${
                              b.status === "active"
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() => handleToggle(b.id, b.name, b.status)}
                          >
                            <i
                              className={`bi ${b.status === "active" ? "bi-toggle-on" : "bi-toggle-off"}`}
                            />
                            {b.status === "active" ? "Tắt" : "Bật"}
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
