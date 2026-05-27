// ── Thay block USER/GUEST trong RoleRoutes của App.jsx ────────────────────────
// Copy đoạn này vào App.jsx, thay thế toàn bộ hàm RoleRoutes + root App

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import RegisterAuthor from "./Components/Auth/RegisterAuthor";
import AdminLayout from "./Layouts/AdminLayout";
import AuthorsLayout from "./Layouts/AuthorsLayout";
import UserLayout from "./Layouts/UserLayout";
import AdminPage, {
  AdminBooksPage,
  AdminAuthorsPage,
  AdminUsersPage,
  AdminWalletPage,
} from "./Page/Admin/AdminPage";
import AuthorsPage from "./Page/Authors/AuthorsPage";
import UserBookList from "./Components/User/BookList";
import Cart from "./Components/User/Cart";
import Profile from "./Components/User/UserProfile";
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
function AuthGate({ onLogin, onGuest }) {
  const [page, setPage] = useState("login");
  const Page = AUTH_PAGES[page];
  return (
    <Page
      onSuccess={onLogin}
      goToLogin={() => setPage("login")}
      goToRegister={() => setPage("register")}
      goToRegisterAuthor={() => setPage("register-author")}
      onGuest={onGuest}
    />
  );
}

// ── guard: yêu cầu login ──────────────────────────────────────────────────────
function LoginRequired({ onShowLogin }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <i
        className="bi bi-lock-fill mb-3"
        style={{ fontSize: 48, color: "#dee2e6" }}
      />
      <h5 className="text-muted mb-2">Bạn cần đăng nhập để tiếp tục</h5>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Đăng nhập để thêm sách vào giỏ hàng và mua sách.
      </p>
      <button
        className="btn btn-primary"
        style={{ borderRadius: 20 }}
        onClick={onShowLogin}
      >
        <i className="bi bi-box-arrow-in-right me-1" /> Đăng nhập
      </button>
    </div>
  );
}

// ── hero banner (guest) ───────────────────────────────────────────────────────
function HeroBanner({ onShowLogin }) {
  return (
    <div
      className="position-relative overflow-hidden mb-4"
      style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #3b7ddd 100%)",
        borderRadius: 16,
        padding: "48px 40px",
      }}
    >
      <div style={{ position: "relative", zIndex: 2 }}>
        <span
          className="badge mb-3"
          style={{
            background: "rgba(255,255,255,.2)",
            color: "#fff",
            fontSize: 12,
            padding: "5px 12px",
          }}
        >
          📚 Hàng nghìn đầu sách
        </span>
        <h2
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 12,
          }}
        >
          Khám phá kho sách số
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,.85)",
            fontSize: 15,
            maxWidth: 480,
            marginBottom: 24,
            margin: "0 0 24px",
          }}
        >
          Đọc sách mọi lúc mọi nơi. Hàng nghìn đầu sách từ các tác giả uy tín.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-light fw-semibold"
            style={{ borderRadius: 20 }}
          >
            <i className="bi bi-search me-1" /> Khám phá ngay
          </button>
          <button
            className="btn btn-outline-light"
            style={{ borderRadius: 20 }}
            onClick={onShowLogin}
          >
            Đăng nhập
          </button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          right: 160,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,.04)",
        }}
      />
    </div>
  );
}

// ── role routes ───────────────────────────────────────────────────────────────
function RoleRoutes({ user, onLogout, onShowLogin }) {
  // ADMIN
  if (user?.role === "ADMIN") {
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

  // AUTHOR
  if (user?.role === "AUTHOR") {
    return (
      <AuthorsLayout user={user} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/author/books" replace />} />
          <Route
            path="/author/books"
            element={<AuthorsPage user={user} defaultTab="books" />}
          />
          <Route
            path="/author/profile"
            element={<AuthorsPage user={user} defaultTab="profile" />}
          />
          <Route
            path="/author/wallet"
            element={<AuthorsPage user={user} defaultTab="wallet" />}
          />
          <Route path="/payment" element={<Payment />} />
          <Route path="*" element={<Navigate to="/author/books" replace />} />
        </Routes>
      </AuthorsLayout>
    );
  }

  // USER + GUEST — route-based
  return (
    <UserLayout
      user={user ?? null}
      onLogout={onLogout}
      onShowLogin={onShowLogin}
    >
      <Routes>
        {/* Danh sách sách — ai cũng xem được */}
        <Route
          path="/"
          element={
            <div className="container py-4">
              {!user && <HeroBanner onShowLogin={onShowLogin} />}
              <UserBookList user={user} onShowLogin={onShowLogin} />
            </div>
          }
        />

        {/* Giỏ hàng — cần login */}
        <Route
          path="/cart"
          element={
            <div className="container py-4">
              {user ? <Cart /> : <LoginRequired onShowLogin={onShowLogin} />}
            </div>
          }
        />

        {/* Hồ sơ — cần login */}
        <Route
          path="/profile"
          element={
            <div className="container py-4">
              {user ? (
                <Profile user={user} />
              ) : (
                <LoginRequired onShowLogin={onShowLogin} />
              )}
            </div>
          }
        />

        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserLayout>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(loadSession());
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setIsGuest(false);
    navigate("/");
  };
  const handleLogout = () => {
    clearSession();
    setUser(null);
    setIsGuest(false);
    navigate("/");
  };
  const handleGuest = () => {
    setIsGuest(true);
  };
  const handleShowLogin = () => {
    setIsGuest(false);
    setUser(null);
  };

  if (user === undefined) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthGate onLogin={handleLogin} onGuest={handleGuest} />;
  }

  return (
    <RoleRoutes
      user={user}
      onLogout={handleLogout}
      onShowLogin={handleShowLogin}
    />
  );
}
