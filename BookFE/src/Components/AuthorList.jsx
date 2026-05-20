import { useEffect, useState } from "react";
import { getAuthors, deleteAuthor } from "../Api/authorApi";

export default function AuthorList({ user, reload, onEdit }) {
  const [authors, setAuthors] = useState([]);
  const isAdmin = user?.role === "ADMIN";

  const load = async () => {
    const res = await getAuthors();
    setAuthors(res.data);
  };

  useEffect(() => {
    load();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!window.confirm("Vô hiệu hóa tác giả này?")) return;
    await deleteAuthor(id);
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
          <p>@{a.username} · {a.email}</p>
          <p>🌍 {a.nationality || "—"}</p>
          {a.biography && <p className="desc">{a.biography}</p>}
          <p>📌 {a.active === false ? "INACTIVE" : "ACTIVE"}</p>

          <div className="form-actions">
            {(isAdmin || user.id === a.id) && (
              <button type="button" className="btn-secondary" onClick={() => onEdit(a)}>
                Sửa
              </button>
            )}
            {isAdmin && (
              <button type="button" className="btn-delete" onClick={() => handleDelete(a.id)}>
                Vô hiệu hóa
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
