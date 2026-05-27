import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import RegisterAuthor from "./Components/Auth/RegisterAuthor";
import AdminLayout from "./Layouts/AdminLayout";
import AdminPage, {
  AdminBooksPage,
  AdminAuthorsPage,
  AdminUsersPage,
  AdminWalletPage,
} from "./Page/Admin/AdminPage";
import AuthorsPage from "./Page/Authors/AuthorsPage";
import UserPage from "./Page/User/UserPage";
import Payment from "./Components/User/Payment";

// ── helpers ───────────────────────────────────────────────────────────────────

function loadSession() {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ── auth gate ─────────────────────────────────────────────────────────────────

const AUTH_PAGES = {
  login: Login,
  register: Register,
  "register-author": RegisterAuthor,
};

function AuthGate({ onLogin }) {
  const [page, setPage] = useState("login");
  const Page = AUTH_PAGES[page];
  return (
    <Page
      onSuccess={onLogin}
      goToLogin={() => setPage("login")}
      goToRegister={() => setPage("register")}
      goToRegisterAuthor={() => setPage("register-author")}
    />
  );
}

// ── role routes ───────────────────────────────────────────────────────────────

function RoleRoutes({ user, onLogout }) {
  // ADMIN — dùng AdminLayout + route-based navigation
  if (user.role === "ADMIN") {
    return (
      <AdminLayout user={user} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<AdminPage user={user} />} />
          <Route path="/admin/books" element={<AdminBooksPage user={user} />} />
          <Route
            path="/admin/authors"
            element={<AdminAuthorsPage user={user} />}
          />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/wallet" element={<AdminWalletPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    );
  }

  // AUTHOR & USER — layout cũ giữ nguyên
  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>📚 Digital Book Platform</h1>
          <p className="user-badge">
            {user.fullName} ·{" "}
            <span className={`role role-${user.role}`}>
              {{ AUTHOR: "Tác giả", USER: "Người mua" }[user.role]}
            </span>
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={onLogout}>
          Đăng xuất
        </button>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            user.role === "AUTHOR" ? (
              <AuthorsPage user={user} />
            ) : (
              <UserPage user={user} />
            )
          }
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(loadSession());
    setLoading(false);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    navigate("/");
  };
  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/");
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        Đang tải...
      </div>
    );

  if (!user) return <AuthGate onLogin={handleLogin} />;
  return <RoleRoutes user={user} onLogout={handleLogout} />;
}
