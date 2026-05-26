import { useState } from "react";
import BookForm from "../../Components/Admin/BookForm";
import BookList from "../../Components/Admin/BookList";
import AuthorForm from "../../Components/Admin/AuthorForm";
import AuthorList from "../../Components/Admin/AuthorList";
import Profile from "../../Components/Authors/profile";
import Wallet from "../../Components/Authors/Wallet";

export default function AuthorsPage({ user }) {
  const [tab, setTab] = useState("books");
  const [editingBook, setEditingBook] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [bookReload, setBookReload] = useState(0);
  const [authorReload, setAuthorReload] = useState(0);

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  const navBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        background: tab === key ? "#1976d2" : "#f0f0f0",
        color: tab === key ? "#fff" : "#333",
        fontWeight: tab === key ? "bold" : "normal",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "2px solid #eee",
          background: "#fff",
        }}
      >
        <span style={{ flex: 1, fontWeight: "bold", fontSize: 18 }}>
          {isAdmin ? "🛠️ Admin Panel" : "✍️ Author Panel"}
        </span>

        {navBtn("books", "📚 Sách")}
        {isAdmin && navBtn("authors", "👤 Tác giả")}
        {isAuthor && navBtn("profile", "👤 Hồ sơ")}
        {isAuthor && navBtn("wallet", "💰 Ví")}
      </nav>

      {tab === "books" && (
        <>
          <BookForm
            user={user}
            editing={editingBook}
            onSaved={() => {
              setBookReload((r) => r + 1);
              setEditingBook(null);
            }}
            onCancelEdit={() => setEditingBook(null)}
          />
          <BookList
            user={user}
            reload={bookReload}
            onEdit={(b) => {
              setEditingBook(b);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}

      {tab === "authors" && isAdmin && (
        <>
          <AuthorForm
            user={user}
            editing={editingAuthor}
            onSaved={() => {
              setAuthorReload((r) => r + 1);
              setEditingAuthor(null);
            }}
            onCancelEdit={() => setEditingAuthor(null)}
          />
          <AuthorList
            user={user}
            reload={authorReload}
            onEdit={(a) => {
              setEditingAuthor(a);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}

      {tab === "profile" && isAuthor && <Profile />}
      {tab === "wallet" && isAuthor && <Wallet />}
    </div>
  );
}
