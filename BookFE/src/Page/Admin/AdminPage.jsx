import { useState } from "react";
import BookManagement from "../../Components/Admin/BookManagement";
import AuthorManagement from "../../Components/Admin/AuthorManagement";
import AdminWallet from "../../Components/Admin/AdminWallet";
import UserManagement from "../../Components/Admin/UserManagement";

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("books");

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
          🛠️ Admin Panel
        </span>
        {navBtn("books", "📚 Sách")}
        {isAdmin && navBtn("authors", "👤 Tác giả")}
        {isAdmin && navBtn("users", "👥 Người dùng")}
        {isAdmin && navBtn("wallet", "💰 Ví & Rút tiền")}
      </nav>

      {tab === "books" && <BookManagement user={user} />}
      {tab === "authors" && <AuthorManagement user={user} />}
      {tab === "users" && isAdmin && <UserManagement />}
      {tab === "wallet" && isAdmin && <AdminWallet />}
    </div>
  );
}
