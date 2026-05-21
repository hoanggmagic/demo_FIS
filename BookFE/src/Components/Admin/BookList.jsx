import { useEffect, useState } from "react";
import { getBooks, deleteBook } from "../../Api/Admin/BookApi";

export default function BookList({ user, reload, onEdit }) {
  const [books, setBooks] = useState([]);
  const canModify = user?.role === "ADMIN" || user?.role === "AUTHOR";

  const load = async () => {
    const res = await getBooks();
    setBooks(res.data);
  };

  useEffect(() => {
    load();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sách này?")) return;
    await deleteBook(id);
    load();
  };

  return (
    <section>
      <h3>📚 Danh sách sách</h3>
      {books.length === 0 && <p>Chưa có sách.</p>}

      {books.map((b) => (
        <div key={b.id} className="card book-item">
          <h4>{b.title}</h4>
          {b.description && <p className="desc">{b.description}</p>}
          <p>💰 Giá: {Number(b.price || 0).toLocaleString()} VND</p>
          <p>📅 Năm: {b.publishedYear}</p>
          <p>👤 Tác giả: {b.authorName || "—"}</p>
          <p>📦 Tồn kho: {b.quantity ?? 0}</p>
          <p>📌 {b.status}</p>

          {canModify && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onEdit(b)}
              >
                Sửa
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDelete(b.id)}
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
