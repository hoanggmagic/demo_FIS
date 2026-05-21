import { useEffect, useState } from "react";
import { getBooks, deleteBook } from "../../Api/Admin/BookApi";
import "../../Style/Admin/listBooks.css";

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

      {books.length === 0 ? (
        <p>Chưa có sách.</p>
      ) : (
        <table className="book-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Năm</th>
              <th>Tác giả</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              {canModify && <th>Hành động</th>}
            </tr>
          </thead>

          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.description || "—"}</td>
                <td>{Number(b.price || 0).toLocaleString()} VND</td>
                <td>{b.publishedYear}</td>
                <td>{b.authorName || "—"}</td>
                <td>{b.quantity ?? 0}</td>
                <td>{b.status}</td>

                {canModify && (
                  <td>
                    <button className="btn-secondary" onClick={() => onEdit(b)}>
                      Sửa
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(b.id)}
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
