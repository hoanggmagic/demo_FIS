import { useEffect, useState } from "react";
import { createBook, updateBook } from "../../Api/Admin/BookApi";
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

export default function BookForm({ user, onSaved, editing, onCancelEdit }) {
  const [book, setBook] = useState(empty);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();
  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";
  const canWrite = isAdmin || isAuthor;

  useEffect(() => {
    if (!canWrite) return;
    if (isAdmin) {
      getAuthors()
        .then((res) => setAuthors(res.data))
        .catch(() => setError("Không tải được danh sách tác giả"));
    }
  }, [isAdmin, canWrite]);

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
    const activeAuthors = authors.filter((a) => a.active !== false);

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
      } else {
        await createBook(payload);
      }
      setBook(empty);
      setError("");
      onSaved();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      setError(err.response?.data || "Lưu sách thất bại");
    }
  };

  if (!canWrite) return null;

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{editing ? "✏️ Sửa sách" : "➕ Thêm sách"}</h2>

      <input
        name="title"
        placeholder="Tên sách"
        value={book.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Mô tả"
        value={book.description}
        onChange={handleChange}
        rows={2}
      />
      <input
        name="price"
        type="number"
        placeholder="Giá (VND)"
        value={book.price}
        onChange={handleChange}
      />
      <input
        name="year"
        type="number"
        placeholder={`Năm (max ${currentYear})`}
        value={book.year}
        onChange={handleChange}
        max={currentYear}
      />
      <input
        name="quantity"
        type="number"
        placeholder="Số lượng"
        value={book.quantity}
        onChange={handleChange}
        min={0}
      />

      {isAdmin && (
        <select name="authorId" value={book.authorId} onChange={handleChange}>
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

      <select name="status" value={book.status} onChange={handleChange}>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-add">
          {editing ? "Lưu" : "Thêm sách"}
        </button>
        {editing && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancelEdit}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
