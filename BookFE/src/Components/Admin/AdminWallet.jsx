import { useEffect, useState } from "react";
import api from "../../Api/axiosClient";

const BASE = "/admin/wallet";
const PAGE_SIZE = 10;

const STATUS = {
  PENDING: { label: "Chờ duyệt", cls: "bg-warning text-dark" },
  APPROVED: { label: "Đã duyệt", cls: "bg-success" },
  REJECTED: { label: "Từ chối", cls: "bg-danger" },
};

export default function AdminWallet() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("pending");
  const [toast, setToast] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  // Pagination per tab
  const [pendingPage, setPendingPage] = useState(0);
  const [donePage, setDonePage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [doneTotalPages, setDoneTotalPages] = useState(0);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTab = async (tabName, page) => {
    try {
      const status = tabName === "pending" ? "PENDING" : "";
      const res = await api.get(`${BASE}/withdraw-requests`, {
        params: { page, size: PAGE_SIZE, status },
      });
      const data = res.data;
      if (tabName === "pending") {
        setRequests((prev) => ({ ...prev, pending: data.content || [] }));
        setPendingTotalPages(data.totalPages || 0);
        setPendingCount(data.totalElements || 0);
      } else {
        setRequests((prev) => ({ ...prev, done: data.content || [] }));
        setDoneTotalPages(data.totalPages || 0);
        setDoneCount(data.totalElements || 0);
      }
    } catch {
      showToast("danger", "Lỗi tải dữ liệu");
    }
  };

  useEffect(() => {
    loadTab("pending", pendingPage);
  }, [pendingPage]);
  useEffect(() => {
    loadTab("done", donePage);
  }, [donePage]);

  const handleAction = async (id, action, r) => {
    const label = action === "approve" ? "duyệt" : "từ chối";
    const detail =
      action === "approve"
        ? `Tác giả: ${r.fullName}\nSố tiền: ${Number(r.amount).toLocaleString()} VND\nNgân hàng: ${r.bankName}\nSTK: ${r.accountNumber}\nChủ TK: ${r.accountHolder}`
        : `Từ chối yêu cầu của ${r.fullName}?`;
    if (!window.confirm(`Xác nhận ${label}?\n\n${detail}`)) return;
    try {
      const res = await api.put(
        `${BASE}/withdraw-requests/${id}/${action}`,
        {},
      );
      showToast("success", res.data.message);
      loadTab("pending", pendingPage);
      loadTab("done", donePage);
    } catch (err) {
      showToast("danger", err.response?.data || "Lỗi xử lý");
    }
  };

  const list = tab === "pending" ? requests.pending || [] : requests.done || [];
  const page = tab === "pending" ? pendingPage : donePage;
  const totalPages = tab === "pending" ? pendingTotalPages : doneTotalPages;
  const setPage = tab === "pending" ? setPendingPage : setDonePage;

  const Pagination = () =>
    totalPages <= 1 ? null : (
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2 border-top"
        style={{ fontSize: 13 }}
      >
        <span className="text-muted">
          Trang {page + 1} / {totalPages}
        </span>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(0)}>
              «
            </button>
          </li>
          <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage((p) => p - 1)}>
              ‹
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((i) => Math.abs(i - page) <= 2)
            .map((i) => (
              <li key={i} className={`page-item ${i === page ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              </li>
            ))}
          <li
            className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
          >
            <button className="page-link" onClick={() => setPage((p) => p + 1)}>
              ›
            </button>
          </li>
          <li
            className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => setPage(totalPages - 1)}
            >
              »
            </button>
          </li>
        </ul>
      </div>
    );

  return (
    <div>
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

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
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
                  {pendingCount}
                </h3>
              </div>
              <i
                className="bi bi-hourglass-split"
                style={{ fontSize: 36, color: "#ff9800", opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
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
                  {doneCount}
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

      {/* Tabs + Table */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${tab === "pending" ? "active" : ""}`}
                onClick={() => setTab("pending")}
              >
                <i className="bi bi-hourglass-split" /> Chờ duyệt
                {pendingCount > 0 && (
                  <span className="badge bg-warning text-dark ms-1">
                    {pendingCount}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${tab === "done" ? "active" : ""}`}
                onClick={() => setTab("done")}
              >
                <i className="bi bi-check2-all" /> Đã xử lý
                <span className="badge bg-secondary ms-1">{doneCount}</span>
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
                  <th className="text-center">
                    {tab === "pending" ? "Hành động" : "Trạng thái"}
                  </th>
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
                      <td className="text-center">
                        {tab === "done" ? (
                          <span
                            className={`badge ${STATUS[r.status]?.cls ?? "bg-secondary"}`}
                          >
                            {STATUS[r.status]?.label ?? r.status}
                          </span>
                        ) : (
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
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination />
        </div>
      </div>
    </div>
  );
}
