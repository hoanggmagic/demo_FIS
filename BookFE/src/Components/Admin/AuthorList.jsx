import { useEffect, useState } from "react";
import { getAuthors, deleteAuthor } from "../../Api/Admin/authorApi";

export default function AuthorList({ user, reload, onEdit }) {
  const [authors, setAuthors] = useState([]);
  const isAdmin = user?.role === "ADMIN";

  const load = async () => {
    console.log("call getAuthors...");
    const data = await getAuthors();
    console.log("data:", data);
    setAuthors(data.data);
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
      {authors.length === 0 && <p>Chưa có tác giả.</p>}

      {authors.map((a) => (
        <div key={a.id} className="card">
          <h4>{a.name}</h4>
          <p>
            @{a.username} · {a.email}
          </p>
          <p>🌍 {a.nationality || "—"}</p>
          {a.biography && <p className="desc">{a.biography}</p>}
          <p>📌 {a.active === false ? "INACTIVE" : "ACTIVE"}</p>

          <div className="form-actions">
            {(isAdmin || user.id === a.id) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onEdit(a)}
              >
                Sửa
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className={a.active === false ? "btn-secondary" : "btn-delete"}
                onClick={() => handleDelete(a)}
              >
                {a.active === false ? "Mở lại" : "Vô hiệu hóa"}
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
