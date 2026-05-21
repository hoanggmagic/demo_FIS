import { useEffect, useState } from "react";
import { getAuthors, deleteAuthor } from "../../Api/Admin/authorApi";
import "../../Style/Admin/listBooks.css";

export default function AuthorList({ user, reload, onEdit }) {
  const [authors, setAuthors] = useState([]);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const load = async () => {
    const res = await getAuthors();
    setAuthors(res.data || []);
  };

  useEffect(() => {
    load();
  }, [reload]);

  const handleDelete = async (author) => {
    const action = author.active === false ? "mở lại" : "vô hiệu hóa";

    if (!window.confirm(`Bạn có chắc muốn ${action} tác giả này?`)) return;

    await deleteAuthor(author.id);
    load();
  };

  if (user?.role === "USER") return null;

  return (
    <section>
      <h3>👤 Danh sách tác giả</h3>

      {authors.length === 0 ? (
        <p>Chưa có tác giả.</p>
      ) : (
        <table className="book-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Quốc tịch</th>
              <th>Tiểu sử</th>
              <th>Trạng thái</th>

              {isAdmin && <th>Hành động</th>}
            </tr>
          </thead>

          <tbody>
            {authors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>@{a.username}</td>
                <td>{a.email}</td>
                <td>{a.nationality || "—"}</td>
                <td>{a.biography || "—"}</td>
                <td>{a.active === false ? "INACTIVE" : "ACTIVE"}</td>

                {isAdmin && (
                  <td>
                    {(isAdmin || user?.id === a.id) && (
                      <button
                        className="btn-secondary"
                        onClick={() => onEdit(a)}
                      >
                        Sửa
                      </button>
                    )}

                    <button
                      className={
                        a.active === false ? "btn-secondary" : "btn-delete"
                      }
                      onClick={() => handleDelete(a)}
                    >
                      {a.active === false ? "Mở lại" : "Vô hiệu hóa"}
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
