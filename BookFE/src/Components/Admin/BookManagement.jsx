import { useEffect, useState } from "react";
import {
  getBooks,
  deleteBook,
  createBook,
  updateBook,
} from "../../Api/Admin/BookApi";
import { getAuthors } from "../../Api/Admin/authorApi";

const empty = {
  title: "",
  description: "",
  price: "",
  year: "",
  quantity: "0",
  authorId: "",
  status: "ACTIVE",
};

export default function BookManagement({ user }) {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [book, setBook] = useState(empty);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";
  const canWrite = isAdmin || isAuthor;
  const currentYear = new Date().getFullYear();

  const load = async () => {
    try {
      const res = await getBooks();
      setBooks(res.data || []);
    } catch (err) {
      console.error("Load books error:", err);
    }
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      getAuthors()
        .then((res) => setAuthors(res.data))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (editing) {
      setBook({
        title: editing.title || "",
        description: editing.description || "",
        price: editing.price ?? "",
        year: editing.publishedYear ?? "",
        quantity: editing.quantity ?? 0,
        authorId: editing.authorId ?? "",
        status: editing.status || "ACTIVE",
      });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setBook(empty);
    }
  }, [editing]);

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
    const payload = {
      title: book.title,
      description: book.description || null,
      price: Number(book.price),
      publishedYear: Number(book.year),
      quantity: Number(book.quantity) || 0,
      status: book.status,
      authorId: isAuthor ? user.id : Number(book.authorId),
    };
    try {
      if (editing) {
        await updateBook(editing.id, payload);
        setMessage("✅ Cập nhật sách thành công!");
      } else {
        await createBook(payload);
        setMessage("✅ Thêm sách thành công!");
      }
      setBook(empty);
      setEditing(null);
      setShowForm(false);
      setError("");
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Lưu sách thất bại");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa sách "${title}"?`)) return;
    try {
      await deleteBook(id);
      setMessage("✅ Đã xóa sách!");
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Xóa thất bại");
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setShowForm(false);
    setBook(empty);
    setError("");
  };

  const filtered = books.filter(
    (b) =>
      (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.authorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (!canWrite) return null;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h2>📚 Quản lý sách</h2>

      {/* Nút mở form */}
      <button
        onClick={() => {
          setEditing(null);
          setShowForm(!showForm);
          setError("");
        }}
        style={{
          marginBottom: 16,
          padding: "10px 20px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {showForm && !editing ? "✕ Đóng" : "➕ Thêm sách"}
      </button>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#f9f9f9",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>
            {editing ? "✏️ Sửa sách" : "➕ Thêm sách"}
          </h3>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              name="title"
              placeholder="Tên sách *"
              value={book.title}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="price"
              type="number"
              placeholder="Giá (VND) *"
              value={book.price}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Mô tả"
            value={book.description}
            onChange={handleChange}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <input
              name="year"
              type="number"
              placeholder={`Năm (max ${currentYear}) *`}
              value={book.year}
              onChange={handleChange}
              max={currentYear}
              style={inputStyle}
              required
            />
            <input
              name="quantity"
              type="number"
              placeholder="Số lượng"
              value={book.quantity}
              onChange={handleChange}
              min={0}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {isAdmin && (
              <select
                name="authorId"
                value={book.authorId}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">-- Chọn tác giả --</option>
                {authors
                  .filter((a) => a.active !== false)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (@{a.username})
                    </option>
                  ))}
              </select>
            )}
            <select
              name="status"
              value={book.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✅ {editing ? "Lưu" : "Thêm sách"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: "10px 20px",
                  background: "#999",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Tìm theo tên sách, tác giả..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
          marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      {message && (
        <p
          style={{
            color: message.includes("✅") ? "green" : "red",
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          {message}
        </p>
      )}

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>Tiêu đề</th>
            <th style={th}>Mô tả</th>
            <th style={th}>Giá</th>
            <th style={th}>Năm</th>
            <th style={th}>Tác giả</th>
            <th style={th}>Tồn kho</th>
            <th style={th}>Trạng thái</th>
            <th style={th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{ textAlign: "center", padding: 20, color: "#999" }}
              >
                Chưa có sách nào
              </td>
            </tr>
          ) : (
            filtered.map((b) => (
              <tr key={b.id}>
                <td style={td}>
                  <strong>{b.title}</strong>
                </td>
                <td style={td} title={b.description}>
                  {b.description
                    ? b.description.length > 40
                      ? b.description.slice(0, 40) + "..."
                      : b.description
                    : "—"}
                </td>
                <td style={td}>{Number(b.price || 0).toLocaleString()} VND</td>
                <td style={td}>{b.publishedYear}</td>
                <td style={td}>{b.authorName || "—"}</td>
                <td style={td}>{b.quantity ?? 0}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#fff",
                      background: b.status === "ACTIVE" ? "#4caf50" : "#e53935",
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setEditing(b)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: "#1976d2",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: "#e53935",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
};
const td = { padding: "10px 12px", borderBottom: "1px solid #eee" };
const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  flex: 1,
};
