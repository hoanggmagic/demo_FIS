import { useEffect, useState } from "react";
import Login from "./Components/Login";
import BookForm from "./Components/BookForm";
import BookList from "./Components/BookList";
import AuthorForm from "./Components/AuthorForm";
import AuthorList from "./Components/AuthorList";
import { getMe } from "./Api/authApi";

export default function App() {
  const [user, setUser] = useState(null);
  const [reload, setReload] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (!token) {
      setLoading(false);
      return;
    }
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
    getMe()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => setReload((p) => !p);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setEditingBook(null);
    setEditingAuthor(null);
  };

  if (loading) {
    return <motion className="container">Đang tải...</motion>;
  }

  if (!user) {
    return <Login onSuccess={setUser} />;
  }

  const roleLabel = { ADMIN: "Quản trị", AUTHOR: "Tác giả", USER: "Người mua" }[
    user.role
  ];

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>📚 Digital Book Platform</h1>
          <p className="user-badge">
            {user.fullName} ·{" "}
            <span className={`role role-${user.role}`}>{roleLabel}</span>
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      {(user.role === "ADMIN" || user.role === "AUTHOR") && (
        <section className="grid-2">
          <AuthorForm
            user={user}
            editing={editingAuthor}
            onSaved={refresh}
            onCancelEdit={() => setEditingAuthor(null)}
          />
          <BookForm
            user={user}
            editing={editingBook}
            onSaved={refresh}
            onCancelEdit={() => setEditingBook(null)}
          />
        </section>
      )}

      <AuthorList user={user} reload={reload} onEdit={setEditingAuthor} />

      <BookList user={user} reload={reload} onEdit={setEditingBook} />
    </div>
  );
}
