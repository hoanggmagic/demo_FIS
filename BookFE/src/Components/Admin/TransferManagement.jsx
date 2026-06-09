import { useEffect, useState } from "react";
import { getTransfers, createTransfer } from "../../Api/Admin/TransferApi";
import { getBranches } from "../../Api/Admin/InventoryApi";
import { getBooks } from "../../Api/Admin/BookApi";

export default function TransferManagement() {
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [books, setBooks] = useState([]);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [form, setForm] = useState({
    bookId: "",
    fromBranchId: "",
    toBranchId: "",
    quantity: "",
    note: "",
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Branches + books chỉ load 1 lần
  useEffect(() => {
    const init = async () => {
      try {
        const [branchRes, bookRes] = await Promise.all([
          getBranches(),
          getBooks(),
        ]);
        setBranches(branchRes.data || []);
        const bookData = bookRes?.data;
        setBooks(Array.isArray(bookData) ? bookData : bookData?.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const loadTransfers = async (p = page) => {
    try {
      const res = await getTransfers(p, PAGE_SIZE);
      const data = res.data;
      setTransfers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTransfers(page);
  }, [page]);

  const filteredBooks = books.filter((b) =>
    (b.title || "").toLowerCase().includes(bookSearch.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.bookId ||
      !form.fromBranchId ||
      !form.toBranchId ||
      !form.quantity
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      setError("Chi nhánh nguồn và đích không được giống nhau");
      return;
    }
    setLoading(true);
    try {
      await createTransfer(
        Number(form.bookId),
        Number(form.fromBranchId),
        Number(form.toBranchId),
        Number(form.quantity),
        form.note,
      );
      showToast("success", "Điều chuyển thành công!");
      setForm({
        bookId: "",
        fromBranchId: "",
        toBranchId: "",
        quantity: "",
        note: "",
      });
      setBookSearch("");
      setShowForm(false);
      setError("");
      setPage(0);
      loadTransfers(0);
    } catch (err) {
      setError(err.response?.data || "Điều chuyển thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
          Điều chuyển sách giữa các chi nhánh
        </span>
        <button
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"} d-flex align-items-center gap-2`}
          onClick={() => {
            setShowForm((v) => !v);
            setError("");
          }}
        >
          <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`} />
          {showForm ? "Đóng" : "Tạo phiếu điều chuyển"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i className="bi bi-arrow-left-right text-primary" />
            <strong>Phiếu điều chuyển</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6" style={{ position: "relative" }}>
                  <label className="form-label">
                    Sách <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm tên sách..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setForm({ ...form, bookId: "" });
                      setShowBookDropdown(true);
                    }}
                    onFocus={() => setShowBookDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowBookDropdown(false), 200)
                    }
                  />
                  {form.bookId && (
                    <small className="text-success">
                      ✓{" "}
                      {
                        books.find((b) => String(b.id) === String(form.bookId))
                          ?.title
                      }
                    </small>
                  )}
                  {showBookDropdown && bookSearch && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 999,
                        background: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: 6,
                        width: "100%",
                        maxHeight: 220,
                        overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                      }}
                    >
                      {filteredBooks.length === 0 ? (
                        <div
                          className="px-3 py-2 text-muted"
                          style={{ fontSize: 13 }}
                        >
                          Không tìm thấy sách
                        </div>
                      ) : (
                        filteredBooks.map((b) => (
                          <div
                            key={b.id}
                            className="px-3 py-2"
                            style={{ cursor: "pointer", fontSize: 13 }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f8f9fa")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            onMouseDown={() => {
                              setForm({ ...form, bookId: b.id });
                              setBookSearch(b.title);
                              setShowBookDropdown(false);
                            }}
                          >
                            {b.title}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Số lượng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Chi nhánh nguồn <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.fromBranchId}
                    onChange={(e) =>
                      setForm({ ...form, fromBranchId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Chi nhánh đích <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.toBranchId}
                    onChange={(e) =>
                      setForm({ ...form, toBranchId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches
                      .filter((b) => String(b.id) !== String(form.fromBranchId))
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Ghi chú</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Lý do điều chuyển..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0 py-2">
                  <i className="bi bi-exclamation-triangle-fill" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-success d-flex align-items-center gap-2 mt-3"
              >
                <i className="bi bi-check-lg" />
                {loading ? "Đang xử lý..." : "Xác nhận điều chuyển"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <strong>Lịch sử điều chuyển</strong>
          </span>
          <span className="badge bg-primary">{totalElements} phiếu</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Sách</th>
                  <th>Từ chi nhánh</th>
                  <th>Đến chi nhánh</th>
                  <th className="text-center">Số lượng</th>
                  <th>Ghi chú</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Chưa có phiếu điều chuyển nào
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t.id}>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        #{t.id}
                      </td>
                      <td>
                        <strong>{t.bookTitle}</strong>
                      </td>
                      <td>
                        <span className="badge bg-danger bg-opacity-75">
                          <i className="bi bi-shop me-1" />
                          {t.fromBranchName}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-75">
                          <i className="bi bi-shop me-1" />
                          {t.toBranchName}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary">{t.quantity}</span>
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {t.note || "—"}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString("vi-VN")
                          : "—"}
                      </td>
                    </tr>
                  ))
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
                Trang {page + 1} / {totalPages} — {totalElements} phiếu
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
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => Math.abs(i - page) <= 2)
                  .map((i) => (
                    <li
                      key={i}
                      className={`page-item ${i === page ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => setPage(i)}>
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
  );
}
