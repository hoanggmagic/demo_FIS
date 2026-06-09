import { useEffect, useState } from "react";
import {
  getInventory,
  getBranches,
  upsertInventory,
} from "../../Api/Admin/InventoryApi";
import { getBooks } from "../../Api/Admin/BookApi";

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [books, setBooks] = useState([]);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bookId: "", branchId: "", quantity: "" });
  const [error, setError] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Load branches + books 1 lần duy nhất
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

  // Load inventory — dùng useCallback-style để tránh khai báo trùng
  const loadInventory = async (p, s, b) => {
    try {
      const invRes = await getInventory(s, b, p, PAGE_SIZE);
      const data = invRes.data;
      setInventory(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset trang 0 khi đổi filter
  useEffect(() => {
    setPage(0);
    loadInventory(0, search, filterBranch);
  }, [search, filterBranch]);

  // Đổi trang (không chạy khi page bị reset về 0 từ effect trên vì deps khác nhau)
  useEffect(() => {
    loadInventory(page, search, filterBranch);
  }, [page]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookId || !form.branchId || form.quantity === "") {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (Number(form.quantity) === 0) {
      setError("Số lượng thay đổi không được là 0");
      return;
    }
    try {
      await upsertInventory(
        Number(form.bookId),
        Number(form.branchId),
        Number(form.quantity),
      );
      showToast("success", "Cập nhật tồn kho thành công!");
      setForm({ bookId: "", branchId: "", quantity: "" });
      setBookSearch("");
      setShowForm(false);
      setError("");
      loadInventory(page, search, filterBranch);
    } catch (err) {
      setError(err.response?.data || "Cập nhật thất bại");
    }
  };

  const filteredBooks = books.filter((b) =>
    (b.title || "").toLowerCase().includes(bookSearch.toLowerCase()),
  );

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

      {/* Header + Filters */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên sách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ maxWidth: 250 }}
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"} d-flex align-items-center gap-2`}
          onClick={() => {
            setShowForm((v) => !v);
            setError("");
          }}
        >
          <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`} />
          {showForm ? "Đóng" : "Cập nhật tồn kho"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i className="bi bi-boxes text-primary" />
            <strong>Thêm / Cập nhật số lượng theo chi nhánh</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4" style={{ position: "relative" }}>
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
                            style={{
                              cursor: "pointer",
                              fontSize: 13,
                              background:
                                String(form.bookId) === String(b.id)
                                  ? "#eff6ff"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f8f9fa")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                String(form.bookId) === String(b.id)
                                  ? "#eff6ff"
                                  : "transparent")
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
                <div className="col-md-4">
                  <label className="form-label">
                    Chi nhánh <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.branchId}
                    onChange={(e) =>
                      setForm({ ...form, branchId: e.target.value })
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
                <div className="col-md-4">
                  <label className="form-label">
                    Số lượng(+) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.quantity}
                    min={0}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
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
                className="btn btn-success d-flex align-items-center gap-2 mt-3"
              >
                <i className="bi bi-check-lg" /> Lưu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-boxes text-primary" />
            <strong>Tồn kho theo chi nhánh</strong>
          </span>
          <span className="badge bg-primary">{totalElements} bản ghi</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tên sách</th>
                  <th>Chi nhánh</th>
                  <th className="text-center">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Chưa có dữ liệu tồn kho
                    </td>
                  </tr>
                ) : (
                  inventory.map((i, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{i.bookTitle}</strong>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">
                          <i className="bi bi-shop me-1" />
                          {i.branchName}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${i.quantity > 0 ? "bg-success" : "bg-danger"}`}
                        >
                          {i.quantity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className="d-flex align-items-center justify-content-between px-3 py-2 border-top"
              style={{ fontSize: 13 }}
            >
              <span className="text-muted">
                Trang {page + 1} / {totalPages} — {totalElements} bản ghi
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
