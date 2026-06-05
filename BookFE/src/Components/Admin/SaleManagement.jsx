import { useEffect, useState } from "react";
import { getBooks } from "../../Api/Admin/BookApi";
import { setSale, removeSale } from "../../Api/Admin/SaleApi";

const IMG_BASE = "http://localhost:8080/uploads/books/";

const toDatetimeLocal = (iso) => (iso ? iso.slice(0, 16) : "");
const toISO = (datetimeLocal) => (datetimeLocal ? datetimeLocal + ":00" : null);

const now = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function SaleManagement() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // book đang set sale
  const [form, setForm] = useState({
    salePrice: "",
    saleStart: "",
    saleEnd: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await getBooks();
      setBooks(Array.isArray(res) ? res : res.data || []);
    } catch {
      setBooks([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      salePrice:
        book.discountedPrice > 0 && book.discountedPrice !== book.originalPrice
          ? book.discountedPrice
          : "",
      saleStart: "",
      saleEnd: "",
    });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.salePrice || !form.saleStart || !form.saleEnd) {
      setError("Vui lòng nhập đầy đủ giá sale, ngày bắt đầu và kết thúc");
      return;
    }
    if (Number(form.salePrice) <= 0) {
      setError("Giá sale phải lớn hơn 0");
      return;
    }
    if (new Date(form.saleStart) >= new Date(form.saleEnd)) {
      setError("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    setLoading(true);
    try {
      await setSale(editing.id, {
        salePrice: String(form.salePrice),
        saleStart: toISO(form.saleStart),
        saleEnd: toISO(form.saleEnd),
      });
      showToast("success", `Đặt sale cho "${editing.title}" thành công!`);
      setEditing(null);
      load();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === "string" ? msg : "Đặt sale thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (book) => {
    if (!window.confirm(`Xóa sale cho "${book.title}"?`)) return;
    try {
      await removeSale(book.id);
      showToast("success", "Đã xóa sale!");
      load();
    } catch {
      showToast("danger", "Xóa sale thất bại");
    }
  };

  const isOnSale = (b) =>
    b.discountedPrice > 0 && b.discountedPrice < b.originalPrice;

  const filtered = books.filter(
    (b) =>
      (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.authorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible d-flex align-items-center gap-2`}
          style={{ marginBottom: 20 }}
        >
          <i
            className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
          />
          {toast.msg}
          <button
            className="btn-close ms-auto"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* Modal set sale */}
      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 28,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 8px 32px rgba(0,0,0,.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <i
                className="bi bi-tag-fill"
                style={{ color: "#dc2626", fontSize: 20 }}
              />
              <strong style={{ fontSize: 16 }}>
                Đặt sale — {editing.title}
              </strong>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              Giá gốc:{" "}
              <strong style={{ color: "#1e293b" }}>
                {Number(editing.originalPrice || 0).toLocaleString()} VND
              </strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Giá sale (VND) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Nhập giá sale..."
                  value={form.salePrice}
                  onChange={(e) => {
                    setForm({ ...form, salePrice: e.target.value });
                    setError("");
                  }}
                />
                {form.salePrice &&
                  editing.originalPrice &&
                  Number(form.salePrice) < Number(editing.originalPrice) && (
                    <small style={{ color: "#16a34a" }}>
                      Giảm{" "}
                      {Math.round(
                        (1 - form.salePrice / editing.originalPrice) * 100,
                      )}
                      % so với giá gốc
                    </small>
                  )}
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Ngày bắt đầu <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  min={now()}
                  value={form.saleStart}
                  onChange={(e) => {
                    setForm({ ...form, saleStart: e.target.value });
                    setError("");
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Ngày kết thúc <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  min={form.saleStart || now()}
                  value={form.saleEnd}
                  onChange={(e) => {
                    setForm({ ...form, saleEnd: e.target.value });
                    setError("");
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0 py-2"
                style={{ fontSize: 13 }}
              >
                <i className="bi bi-exclamation-triangle-fill" /> {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Xác nhận sale"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h5 style={{ margin: 0, fontWeight: 700 }}>🏷️ Quản lý Sale</h5>
          <small style={{ color: "#64748b" }}>
            Đặt giá sale theo thời gian cho từng sách
          </small>
        </div>
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-tag text-danger" />
            <strong>Danh sách sách</strong>
          </span>
          <span className="badge bg-danger">
            {filtered.filter(isOnSale).length} đang sale
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th>Giá gốc</th>
                  <th>Giá sale</th>
                  <th>Giảm</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Không có sách nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const onSale = isOnSale(b);
                    const pct = onSale
                      ? Math.round(
                          (1 - b.discountedPrice / b.originalPrice) * 100,
                        )
                      : 0;
                    return (
                      <tr key={b.id}>
                        <td>
                          <img
                            src={
                              b.images?.length > 0
                                ? `${IMG_BASE}${b.images[0]}`
                                : "/no-image.png"
                            }
                            alt=""
                            style={{
                              width: 48,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </td>
                        <td>
                          <strong>{b.title}</strong>
                        </td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {b.authorName || "—"}
                        </td>
                        <td className="text-nowrap">
                          {Number(b.originalPrice || 0).toLocaleString()} VND
                        </td>
                        <td className="text-nowrap">
                          {onSale ? (
                            <span style={{ color: "#dc2626", fontWeight: 700 }}>
                              {Number(b.discountedPrice).toLocaleString()} VND
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td>
                          {onSale ? (
                            <span className="badge bg-danger">-{pct}%</span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          {onSale ? (
                            <span className="badge bg-success">Đang sale</span>
                          ) : (
                            <span className="badge bg-secondary">
                              Bình thường
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              onClick={() => openEdit(b)}
                            >
                              <i className="bi bi-tag" />{" "}
                              {onSale ? "Sửa sale" : "Đặt sale"}
                            </button>
                            {onSale && (
                              <button
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                onClick={() => handleRemove(b)}
                              >
                                <i className="bi bi-x-lg" /> Xóa sale
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
