import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AuthPage from "./Components/Auth/AuthPage";
import AdminLayout from "./Layouts/AdminLayout";
import AuthorsLayout from "./Layouts/AuthorsLayout";
import UserLayout from "./Layouts/UserLayout";
import AdminPage, {
  AdminBooksPage,
  AdminAuthorsPage,
  AdminUsersPage,
  AdminWalletPage,
  AdminCategoriesPage,
  AdminInventoryPage,
  AdminTransfersPage,
  AdminBranchesPage,
  AdminRevenuePage,
  AdminOrdersPage,
  AdminSalePage,
} from "./Page/Admin/AdminPage";
import AuthorsPage from "./Page/Authors/AuthorsPage";
import UserBookList from "./Components/User/BookList";
import BookPublicDetail from "./Components/User/BookPublicDetail";
import Cart from "./Components/User/Cart";
import Checkout from "./Components/User/CheckOut";
import Profile from "./Components/User/UserProfile";
import Payment from "./Components/User/Payment";
import useSeo from "./hooks/useSeo";
import { initAllEffects } from "./utils/scrollEffects";

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
function RoleRoutes({ user, onLogin, onLogout, onShowLogin }) {
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
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/transfers" element={<AdminTransfersPage />} />
          <Route path="/admin/branches" element={<AdminBranchesPage />} />
          <Route path="/admin/revenue" element={<AdminRevenuePage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/sale" element={<AdminSalePage />} />
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

  // USER + GUEST — ai cũng vào được, chỉ chặn ở cart/profile
  return (
    <UserLayout
      user={user ?? null}
      onLogout={onLogout}
      onShowLogin={onShowLogin}
    >
      <Routes>
        {/* Trang chủ — ai cũng xem được */}
        <Route
          path="/"
          element={
            <div className="container py-4">
              {!user && <HeroBanner onShowLogin={onShowLogin} />}
              <UserBookList user={user} onShowLogin={onShowLogin} />
            </div>
          }
        />

        <Route
          path="/books/:bookSlug"
          element={<BookPublicDetail user={user} onShowLogin={onShowLogin} />}
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

        <Route
          path="/checkout"
          element={
            <div className="container py-4">
              {user ? (
                <Checkout />
              ) : (
                <LoginRequired onShowLogin={onShowLogin} />
              )}
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

        {/* Auth — hiện ngay trong layout user, không tách trang riêng */}
        <Route path="/login" element={<AuthPage onLogin={onLogin} />} />
        <Route path="/register" element={<AuthPage onLogin={onLogin} />} />
        <Route
          path="/register-author"
          element={<AuthPage onLogin={onLogin} />}
        />
        <Route
          path="/forgot-password"
          element={<AuthPage onLogin={onLogin} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserLayout>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => loadSession());
  const navigate = useNavigate();
  const location = useLocation();

  useSeo(location.pathname);

  // Initialize all scroll and interaction effects
  useEffect(() => {
    initAllEffects();
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    const role = u.role?.toUpperCase();
    if (role === "ADMIN") navigate("/");
    else if (role === "AUTHOR") navigate("/author/books");
    // USER → ở lại trang hiện tại (AuthPage tự navigate về fromPath)
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/");
  };

  const goToLogin = () =>
    navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });

  return (
    <RoleRoutes
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onShowLogin={goToLogin}
    />
  );
}
