import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserBookList from "../../Components/User/BookList";
import Cart from "../../Components/User/Cart";
import Profile from "../../Components/User/UserProfile";
import { getCart } from "../../Api/User/CartApi";

// ── Login required guard ──────────────────────────────────────────────────────
function LoginRequired({ message = "Bạn cần đăng nhập để tiếp tục." }) {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <i
        className="bi bi-lock-fill mb-3"
        style={{ fontSize: 48, color: "#dee2e6" }}
      />
      <h5 className="text-muted mb-2">{message}</h5>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Đăng nhập để thêm sách vào giỏ hàng và mua sách.
      </p>
      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          style={{ borderRadius: 20 }}
          onClick={() => navigate("/login")}
        >
          <i className="bi bi-box-arrow-in-right me-1" /> Đăng nhập
        </button>
        <button
          className="btn btn-outline-secondary"
          style={{ borderRadius: 20 }}
          onClick={() => navigate("/register")}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}

// ── Hero banner (guest) ───────────────────────────────────────────────────────
function HeroBanner() {
  const navigate = useNavigate();
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
          }}
        >
          Đọc sách mọi lúc mọi nơi. Hàng nghìn đầu sách từ các tác giả uy tín
          trong và ngoài nước.
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
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </div>
      </div>
      {/* Decorations */}
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

// ── Tab nav ───────────────────────────────────────────────────────────────────
function TabNav({ tab, setTab, cartCount, user }) {
  const tabs = [
    { key: "books", icon: "bi-grid", label: "Danh sách sácd" },
    {
      key: "cart",
      icon: "bi-cart3",
      label: "Giỏ hàng",
      badge: cartCount,
      requireAuth: true,
    },
    {
      key: "profile",
      icon: "bi-person",
      label: "Hồ sơ cá nhân",
      requireAuth: true,
    },
  ];

  return (
    <ul className="nav nav-tabs mb-4 border-bottom">
      {tabs.map((t) => (
        <li className="nav-item" key={t.key}>
          <button
            className={`nav-link d-flex align-items-center gap-2 position-relative ${tab === t.key ? "active fw-semibold" : "text-muted"}`}
            onClick={() => setTab(t.key)}
            style={{
              border: "none",
              borderBottom:
                tab === t.key ? "2px solid #3b7ddd" : "2px solid transparent",
              borderRadius: 0,
              padding: "10px 16px",
              background: "none",
            }}
          >
            <i className={`bi ${t.icon}`} />
            {t.label}
            {t.requireAuth && !user && (
              <i
                className="bi bi-lock-fill ms-1"
                style={{ fontSize: 10, color: "#adb5bd" }}
              />
            )}
            {t.badge > 0 && (
              <span
                className="badge rounded-pill bg-danger"
                style={{ fontSize: 10 }}
              >
                {t.badge}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── UserPage ──────────────────────────────────────────────────────────────────
export default function UserPage({ user }) {
  const [tab, setTab] = useState("books");
  const [cartReload, setCartReload] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = async () => {
    if (!user) return;
    try {
      const res = await getCart();
      setCartCount(res.data.length);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, [cartReload, user]);

  const handleCartUpdate = () => setCartReload((r) => r + 1);

  const requireAuth = (component) => {
    if (!user) return <LoginRequired />;
    return component;
  };

  return (
    <div className="container py-4">
      {/* Hero chỉ hiện cho guest */}
      {!user && <HeroBanner />}

      {/* Tab nav */}
      <TabNav tab={tab} setTab={setTab} cartCount={cartCount} user={user} />

      {/* Content */}
      {tab === "books" && (
        <UserBookList onCartUpdate={handleCartUpdate} user={user} />
      )}
      {tab === "cart" && requireAuth(<Cart reload={cartReload} />)}
      {tab === "profile" && requireAuth(<Profile user={user} />)}
    </div>
  );
}
