import { useEffect, useState } from "react";
import {
  getOrders,
  getOrderItems,
  updateOrderStatus,
} from "../../Api/Admin/AdminOrderApi";

const STATUS_COLORS = {
  PENDING: { bg: "#fef3c7", color: "#d97706", label: "Chờ thanh toán" },
  SUCCESS: { bg: "#d1fae5", color: "#059669", label: "Thành công" },
  CANCELLED: { bg: "#fee2e2", color: "#dc2626", label: "Đã hủy" },
  FAILED: { bg: "#fee2e2", color: "#dc2626", label: "Thất bại" },
};

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await getOrders(filterStatus, from, to, p, PAGE_SIZE);
      const data = res.data;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 0 khi đổi filter
  useEffect(() => {
    setPage(0);
    load(0);
  }, [filterStatus, from, to]);

  // Load khi đổi page (nhưng không chạy lần đầu — đã có useEffect trên)
  useEffect(() => {
    load(page);
  }, [page]);

  const handleViewDetail = async (order) => {
    setSelected(order);
    try {
      const res = await getOrderItems(order.id);
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      showToast("success", "Cập nhật trạng thái thành công!");
      load(page);
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch (err) {
      showToast("danger", "Cập nhật thất bại");
    }
  };

  // Search lọc client-side trên trang hiện tại
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      (o.userName || "").toLowerCase().includes(q) ||
      (o.username || "").toLowerCase().includes(q)
    );
  });

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

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div className="input-group" style={{ maxWidth: 260 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo ID, tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="SUCCESS">Thành công</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="FAILED">Thất bại</option>
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label
            style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}
          >
            Từ
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 150 }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label
            style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}
          >
            Đến
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 150 }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-1"
          onClick={() => {
            setPage(0);
            load(0);
          }}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise" />
          {loading ? "Đang tải..." : "Lọc"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Table */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-cart3 text-primary" />
                <strong>Danh sách đơn hàng</strong>
              </span>
              <span className="badge bg-primary">{totalElements} đơn</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Khách hàng</th>
                      <th>Chi nhánh</th>
                      <th className="text-end">Tổng tiền</th>
                      <th className="text-center">Trạng thái</th>
                      <th>Thời gian</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm me-2" />
                          Đang tải...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          <i className="bi bi-inbox fs-4 d-block mb-1" />
                          Chưa có đơn hàng
                        </td>
                      </tr>
                    ) : (
                      filtered.map((o) => {
                        const s =
                          STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                        return (
                          <tr
                            key={o.id}
                            style={{
                              background:
                                selected?.id === o.id
                                  ? "#f8faff"
                                  : "transparent",
                            }}
                          >
                            <td style={{ fontWeight: 600, color: "#6366f1" }}>
                              #{o.id}
                            </td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>
                                {o.userName || "—"}
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                @{o.username}
                              </div>
                            </td>
                            <td style={{ fontSize: 13 }}>
                              <span className="badge bg-info text-dark">
                                <i className="bi bi-shop me-1" />
                                {o.branchName || "—"}
                              </span>
                            </td>
                            <td
                              className="text-end"
                              style={{ fontWeight: 600, color: "#059669" }}
                            >
                              {fmt(o.totalPrice)}
                            </td>
                            <td className="text-center">
                              <span
                                style={{
                                  background: s.bg,
                                  color: s.color,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {s.label}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: "#64748b" }}>
                              {o.createdAt
                                ? new Date(o.createdAt).toLocaleString("vi-VN")
                                : "—"}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewDetail(o)}
                              >
                                <i className="bi bi-eye" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="d-flex align-items-center justify-content-between px-3 py-2 border-top"
                  style={{ fontSize: 13 }}
                >
                  <span className="text-muted">
                    Trang {page + 1} / {totalPages} — {totalElements} đơn hàng
                  </span>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage(0)}>
                        «
                      </button>
                    </li>
                    <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => p - 1)}
                      >
                        ‹
                      </button>
                    </li>

                    {/* Hiển thị số trang xung quanh trang hiện tại */}
                    {Array.from({ length: totalPages }, (_, i) => i)
                      .filter((i) => Math.abs(i - page) <= 2)
                      .map((i) => (
                        <li
                          key={i}
                          className={`page-item ${i === page ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(i)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}

                    <li
                      className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => p + 1)}
                      >
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
              )}
            </div>
          </div>
        </div>

        {/* Detail panel — giữ nguyên */}
        {selected && (
          <div
            style={{
              width: 360,
              flexShrink: 0,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: 20,
              height: "fit-content",
              position: "sticky",
              top: 80,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h6 style={{ margin: 0, fontWeight: 700 }}>
                Chi tiết đơn #{selected.id}
              </h6>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#94a3b8",
                }}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: 13, marginBottom: 16 }}>
              {[
                ["Khách hàng", selected.userName, { fontWeight: 600 }],
                ["Chi nhánh", selected.branchName, {}],
                [
                  "Tổng tiền",
                  fmt(selected.totalPrice),
                  { fontWeight: 700, color: "#059669" },
                ],
                [
                  "Thời gian",
                  selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("vi-VN")
                    : "—",
                  { fontSize: 12 },
                ],
              ].map(([label, val, style]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={style}>{val}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                }}
              >
                <span style={{ color: "#64748b" }}>Trạng thái</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 140 }}
                  value={selected.status}
                  onChange={(e) =>
                    handleUpdateStatus(selected.id, e.target.value)
                  }
                >
                  <option value="PENDING">Chờ thanh toán</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="FAILED">Thất bại</option>
                </select>
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              <i className="bi bi-bag me-1 text-primary" /> Sách đã đặt
            </div>
            {items.length === 0 ? (
              <div
                className="text-muted text-center py-3"
                style={{ fontSize: 13 }}
              >
                Không có sách
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {item.bookTitle}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#64748b",
                      }}
                    >
                      <span>x{item.quantity}</span>
                      <span style={{ fontWeight: 600, color: "#6366f1" }}>
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
