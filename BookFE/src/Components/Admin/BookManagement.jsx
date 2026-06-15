import { useEffect, useState } from "react";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../../Api/Admin/BookApi";
import { getAuthors } from "../../Api/Admin/authorApi";

const empty = {
  title: "",
  description: "",
  price: "",
  year: "",
  quantity: "0",
  authorId: "",
  categoryId: "",
  status: "ACTIVE",
};
import { categoryApi } from "../../Api/Admin/CategoryApi";

const AUTHOR_LOAD_SIZE = 1000;

export default function BookManagement({ user }) {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(15);
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null); // { type: "success"|"danger", msg }
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [book, setBook] = useState(empty);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await getBooks(page, size);

      console.log("BOOKS:", res.data);

      setBooks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setBooks([]);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => {
        console.log("CATEGORY RESPONSE:", res);
        const list =
          Array.isArray(res) ? res : Array.isArray(res?.content) ? res.content : [];
        setCategories(list);
      })
      .catch((err) => {
        console.log("CATEGORY ERROR:", err);
        setCategories([]);
      });

    getAuthors(0, AUTHOR_LOAD_SIZE, "")
      .then((res) => {
        const list =
          Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.content) ? res.data.content : [];
        setAuthors(list);
      })
      .catch(() => setAuthors([]));
  }, []);

  useEffect(() => {
    if (editing) {
      console.log("EDITING IMAGES:", editing.images);
      setBook({
        title: editing.title || "",
        description: editing.description || "",
        price: editing.price ?? "",
        year: editing.publishedYear ?? "",
        authorId: editing.authorId ?? "",
        categoryId: String(editing.categoryId || ""),
        status: editing.status || "ACTIVE",
      });
      setExistingImages(editing.images || []); // ← load ảnh cũ
      setShowForm(true);
      setImages([]); // reset ảnh mới
    } else {
      setBook(empty);
      setExistingImages([]);
    }
  }, [editing]);

  useEffect(() => {
    const container = document.querySelector(".main-content");

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "year" && Number(value) > currentYear) {
      setError(`Năm không được lớn hơn ${currentYear}`);
      return;
    }
    setError("");
    setBook({ ...book, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!book.title || !book.price || !book.year) {
      setError("Vui lòng nhập tên, giá và năm xuất bản");
      return;
    }
    if (isAdmin && !book.authorId && !editing) {
      setError("Vui lòng chọn tác giả");
      return;
    }
    const formData = new FormData();

    formData.append("title", book.title);

    formData.append("description", book.description || "");

    formData.append("price", Number(book.price));

    formData.append("publishedYear", Number(book.year));

    formData.append("status", book.status);

    formData.append("categoryId", Number(book.categoryId) || "");

    formData.append("authorId", isAuthor ? user.id : Number(book.authorId));

    images.forEach((img) => {
      formData.append("images", img);
    });
    try {
      if (editing) {
        await updateBook(editing.id, formData);
        showToast("success", "Cập nhật sách thành công!");
      } else {
        await createBook(formData);
        showToast("success", "Thêm sách thành công!");
      }
      setBook(empty);
      setEditing(null);
      setShowForm(false);
      setError("");
      load();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        typeof data === "string" ? data : data?.message || "Lưu sách thất bại";
      setError(msg);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa sách "${title}"?`)) return;
    try {
      await deleteBook(id);
      showToast("success", "Đã xóa sách!");
      load();
    } catch {
      showToast("danger", "Xóa thất bại");
    }
  };

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
            placeholder="Tìm theo tên sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
          {showForm && !editing ? "Đóng" : "Thêm sách"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center gap-2">
            <i
              className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} text-primary`}
            />
            <strong>{editing ? "Sửa sách" : "Thêm sách mới"}</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Tên sách <span className="text-danger">*</span>
                  </label>
                  <input
                    name="title"
                    className="form-control"
                    placeholder="Nhập tên sách"
                    value={book.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Giá (VND) <span className="text-danger">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={book.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* ĐOẠN MỚI THAY THẾ VÀO: */}
                <div className="col-md-6">
                  <label className="form-label">Danh mục</label>
                  <select
                    name="categoryId"
                    className="form-select"
                    value={book.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn danh mục --</option>

                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Ảnh sách (tối đa 5)</label>

                  {/* HIỂN THỊ ẢNH CŨ KHI ĐANG SỬA */}
                  {editing && existingImages.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted">Ảnh hiện tại:</small>
                      <div className="d-flex gap-2 flex-wrap mt-1">
                        {existingImages.map((img, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            <img
                              src={`http://localhost:8080/uploads/books/${img}`}
                              alt=""
                              style={{
                                width: 80,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 8,
                                border:
                                  index === 0
                                    ? "2px solid #0d6efd"
                                    : "1px solid #ddd",
                              }}
                            />
                            {index === 0 && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: 4,
                                  left: 0,
                                  right: 0,
                                  textAlign: "center",
                                  fontSize: 10,
                                  background: "#0d6efd",
                                  color: "#fff",
                                  borderRadius: "0 0 6px 6px",
                                }}
                              >
                                Bìa
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 5) {
                        setError("Tối đa 5 ảnh");
                        return;
                      }
                      setImages(files);
                    }}
                  />
                  <small className="text-muted">
                    {editing
                      ? "Chọn ảnh mới để thay thế ảnh cũ, hoặc bỏ trống để giữ nguyên"
                      : "Ảnh đầu tiên sẽ làm ảnh bìa"}
                  </small>

                  {/* Preview ảnh mới chọn */}
                  {images.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {images.map((img, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(img)}
                          alt=""
                          style={{
                            width: 80,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                            border:
                              index === 0
                                ? "2px solid #0d6efd"
                                : "1px solid #ddd",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows={2}
                    placeholder="Mô tả ngắn về sách..."
                    value={book.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Năm xuất bản <span className="text-danger">*</span>
                  </label>
                  <input
                    name="year"
                    type="number"
                    className="form-control"
                    placeholder={`max ${currentYear}`}
                    max={currentYear}
                    value={book.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Trạng thái</label>
                  <select
                    name="status"
                    className="form-select"
                    value={book.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                {isAdmin && (
                  <div className="col-md-6">
                    <label className="form-label">
                      Tác giả{" "}
                      {!editing && <span className="text-danger">*</span>}
                    </label>
                    <select
                      name="authorId"
                      className="form-select"
                      value={book.authorId}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn tác giả --</option>
                      {(authors || [])
                        .filter((a) => a.active !== false)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name || a.fullName || a.username || `Tác giả #${a.id}`}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
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
                  {editing ? "Lưu thay đổi" : "Thêm sách"}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(null);
                      setShowForm(false);
                      setBook(empty);
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
            <i className="bi bi-book text-primary" />
            <strong>Danh sách sách</strong>
          </span>
          <span className="badge bg-primary">{filtered.length} sách</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Giá</th>
                  <th>Năm</th>
                  <th>Tác giả</th>
                  <th>Danh mục</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-4 d-block mb-1" />
                      Chưa có sách nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      {/* ảnh bìa */}
                      <td>
                        <img
                          src={
                            b.images?.length > 0
                              ? `http://localhost:8080/uploads/books/${b.images[0]}`
                              : "/no-image.png"
                          }
                          alt=""
                          style={{
                            width: 60,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ddd",
                          }}
                        />
                      </td>

                      {/* title */}
                      <td>
                        <strong>{b.title}</strong>
                      </td>
                      <td className="text-muted" style={{ maxWidth: 180 }}>
                        <span title={b.description}>
                          {b.description
                            ? b.description.length > 40
                              ? b.description.slice(0, 40) + "…"
                              : b.description
                            : "—"}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        {Number(b.price || 0).toLocaleString()} VND
                      </td>
                      <td>{b.publishedYear}</td>
                      <td>{b.authorName || "—"}</td>

                      <td>{b.categoryName || b.category?.name || "—"}</td>
                      <td className="text-center">
                        <span
                          className={`badge ${b.status === "ACTIVE" ? "bg-success" : "bg-danger"}`}
                        >
                          {b.status}
                        </span>
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
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleDelete(b.id, b.title)}
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
      <div
        style={{
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        <div
          className="d-flex justify-content-center align-items-center gap-1 mt-4 mb-3"
          style={{
            flexWrap: "nowrap",
            minWidth: "max-content",
          }}
        >
          {/* Prev */}
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            style={{
              borderRadius: 8,
              minWidth: 34,
              height: 34,
              padding: "0 10px",
            }}
          >
            ‹
          </button>

          {(() => {
            const pages = [];

            const addPage = (p) => {
              pages.push(
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm ${
                    p === page ? "btn-primary" : "btn-outline-primary"
                  }`}
                  style={{
                    minWidth: 34,
                    width: "auto",
                    flex: "0 0 auto",
                    height: 34,
                    borderRadius: 8,
                    padding: "0 10px",
                    fontWeight: p === page ? 600 : 500,
                  }}
                >
                  {p + 1}
                </button>,
              );
            };

            const addDots = (key) => {
              pages.push(
                <span
                  key={key}
                  style={{
                    padding: "0 6px",
                    color: "#6c757d",
                    fontWeight: 600,
                  }}
                >
                  ...
                </span>,
              );
            };

            if (totalPages <= 7) {
              for (let i = 0; i < totalPages; i++) {
                addPage(i);
              }
            } else {
              addPage(0);

              if (page > 3) {
                addDots("left");
              }

              const start = Math.max(1, page - 1);
              const end = Math.min(totalPages - 2, page + 1);

              for (let i = start; i <= end; i++) {
                addPage(i);
              }

              if (page < totalPages - 4) {
                addDots("right");
              }

              addPage(totalPages - 1);
            }

            return pages;
          })()}

          {/* Next */}
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              borderRadius: 8,
              minWidth: 34,
              height: 34,
              padding: "0 10px",
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
