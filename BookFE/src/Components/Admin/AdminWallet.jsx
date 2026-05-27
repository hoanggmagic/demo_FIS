import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/wallet";
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const STATUS = {
  PENDING: { label: "Chờ duyệt", cls: "bg-warning text-dark" },
  APPROVED: { label: "Đã duyệt", cls: "bg-success" },
  REJECTED: { label: "Từ chối", cls: "bg-danger" },
};

export default function AdminWallet() {
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    try {
      const [balRes, reqRes] = await Promise.all([
        axios.get(`${API}/balance`, getHeaders()),
        axios.get(`${API}/withdraw-requests`, getHeaders()),
      ]);
      setBalance(balRes.data.balance);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action, r) => {
    const label = action === "approve" ? "duyệt" : "từ chối";
    const detail =
      action === "approve"
        ? `Tác giả: ${r.fullName}\nSố tiền: ${Number(r.amount).toLocaleString()} VND\nNgân hàng: ${r.bankName}\nSTK: ${r.accountNumber}\nChủ TK: ${r.accountHolder}`
        : `Từ chối yêu cầu của ${r.fullName}?`;
    if (!window.confirm(`Xác nhận ${label}?\n\n${detail}`)) return;
    try {
      const res = await axios.put(
        `${API}/withdraw-requests/${id}/${action}`,
        {},
        getHeaders(),
      );
      showToast("success", res.data.message);
      load();
    } catch (err) {
      showToast("danger", err.response?.data || "Lỗi xử lý");
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const done = requests.filter((r) => r.status !== "PENDING");
  const list = tab === "pending" ? pending : done;

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

      {/* Balance card */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="card border-0 text-white"
            style={{ background: "linear-gradient(135deg, #1976d2, #42a5f5)" }}
          >
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="mb-1 opacity-75" style={{ fontSize: 13 }}>
                  Số dư ví Admin
                </p>
                <h3 className="mb-0 fw-bold">
                  {Number(balance).toLocaleString()} VND
                </h3>
              </div>
              <i
                className="bi bi-bank2"
                style={{ fontSize: 40, opacity: 0.4 }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 h-100"
            style={{ background: "#fff3e0" }}
          >
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="mb-1 text-muted" style={{ fontSize: 13 }}>
                  Chờ duyệt
                </p>
                <h3 className="mb-0 fw-bold" style={{ color: "#e65100" }}>
                  {pending.length}
                </h3>
              </div>
              <i
                className="bi bi-hourglass-split"
                style={{ fontSize: 36, color: "#ff9800", opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 h-100"
            style={{ background: "#e8f5e9" }}
          >
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="mb-1 text-muted" style={{ fontSize: 13 }}>
                  Đã xử lý
                </p>
                <h3 className="mb-0 fw-bold" style={{ color: "#2e7d32" }}>
                  {done.length}
                </h3>
              </div>
              <i
                className="bi bi-check-circle"
                style={{ fontSize: 36, color: "#4caf50", opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${tab === "pending" ? "active" : ""}`}
                onClick={() => setTab("pending")}
              >
                <i className="bi bi-hourglass-split" />
                Chờ duyệt
                {pending.length > 0 && (
                  <span className="badge bg-warning text-dark ms-1">
                    {pending.length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${tab === "done" ? "active" : ""}`}
                onClick={() => setTab("done")}
              >
                <i className="bi bi-check2-all" />
                Đã xử lý
                <span className="badge bg-secondary ms-1">{done.length}</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tác giả</th>
                  <th>Số tiền</th>
                  <th>Ngân hàng</th>
                  <th>STK</th>
                  <th>Chủ TK</th>
                  <th>Ngày</th>
                  {tab === "done" && (
                    <th className="text-center">Trạng thái</th>
                  )}
                  {tab === "pending" && (
                    <th className="text-center">Hành động</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      {tab === "pending"
                        ? "Không có yêu cầu nào đang chờ"
                        : "Chưa có yêu cầu nào được xử lý"}
                    </td>
                  </tr>
                ) : (
                  list.map((r) => (
                    <tr key={r.id}>
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
                            {r.fullName?.charAt(0)?.toUpperCase() ?? "A"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>
                              {r.fullName}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              @{r.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-danger">
                          {Number(r.amount).toLocaleString()} VND
                        </span>
                      </td>
                      <td>{r.bankName}</td>
                      <td>
                        <code>{r.accountNumber}</code>
                      </td>
                      <td>{r.accountHolder}</td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      {tab === "done" && (
                        <td className="text-center">
                          <span
                            className={`badge ${STATUS[r.status]?.cls ?? "bg-secondary"}`}
                          >
                            {STATUS[r.status]?.label ?? r.status}
                          </span>
                        </td>
                      )}
                      {tab === "pending" && (
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-success d-flex align-items-center gap-1"
                              onClick={() => handleAction(r.id, "approve", r)}
                            >
                              <i className="bi bi-check-lg" /> Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              onClick={() => handleAction(r.id, "reject", r)}
                            >
                              <i className="bi bi-x-lg" /> Từ chối
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
