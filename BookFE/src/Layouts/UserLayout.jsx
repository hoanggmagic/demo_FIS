import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCart } from "../Api/User/CartApi";

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout, onShowLogin, cartCount }) {
  const navigate = useNavigate();
  const [ddOpen, setDdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg bg-white shadow-sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1030,
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <div className="container">
        {/* Brand */}
        <NavLink
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
        >
          <i
            className="bi bi-book-half"
            style={{ fontSize: 22, color: "#3b7ddd" }}
          />
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e" }}>
            Digital Books
          </span>
        </NavLink>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-5`} />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          {/* Nav links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link fw-medium${isActive ? " text-primary" : " text-dark"}`
                }
              >
                <i className="bi bi-grid me-1" /> Danh sách sách
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-link fw-medium d-flex align-items-center gap-1 position-relative${isActive ? " text-primary" : " text-dark"}`
                }
              >
                <i className="bi bi-cart3" /> Giỏ hàng
                {cartCount > 0 && (
                  <span
                    className="badge rounded-pill bg-danger"
                    style={{ fontSize: 10 }}
                  >
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `nav-link fw-medium${isActive ? " text-primary" : " text-dark"}`
                  }
                >
                  <i className="bi bi-person me-1" /> Hồ sơ
                </NavLink>
              </li>
            )}
          </ul>

          {/* User area */}
          {user ? (
            <div className="position-relative">
              <button
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: 20,
                  background: "#f8f9fa",
                  border: "1px solid #dee2e6",
                }}
                onClick={() => setDdOpen((v) => !v)}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#3b7ddd",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {user.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.fullName}
                </span>
                <i className="bi bi-chevron-down" style={{ fontSize: 10 }} />
              </button>

              {ddOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 999 }}
                    onClick={() => setDdOpen(false)}
                  />
                  <ul
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: 10,
                      minWidth: 180,
                      padding: "6px 0",
                      listStyle: "none",
                      margin: 0,
                      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                    }}
                  >
                    <li
                      style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6c757d" }}>
                        Đăng nhập với
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {user.fullName}
                      </div>
                    </li>
                    <li>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 16px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#333",
                        }}
                        onClick={() => {
                          setDdOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <i className="bi bi-person" /> Hồ sơ cá nhân
                      </button>
                    </li>
                    <li
                      style={{ borderTop: "1px solid #f0f0f0", marginTop: 4 }}
                    >
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 16px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#dc3545",
                        }}
                        onClick={() => {
                          setDdOpen(false);
                          onLogout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right" /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                style={{ borderRadius: 20 }}
                onClick={onShowLogin}
              >
                Đăng nhập
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 20 }}
                onClick={onShowLogin}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: "#1a1a2e",
        color: "#adb5bd",
        padding: "40px 0 20px",
      }}
    >
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i
                className="bi bi-book-half"
                style={{ fontSize: 20, color: "#3b7ddd" }}
              />
              <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
                Digital Books
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Nền tảng sách số hàng đầu Việt Nam — kết nối tác giả và độc giả.
            </p>
          </div>
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>
              Danh mục
            </h6>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}
            >
              {[
                "Văn học",
                "Khoa học",
                "Kinh tế",
                "Lịch sử",
                "Kỹ năng sống",
              ].map((c) => (
                <li key={c} style={{ marginBottom: 6 }}>
                  <a
                    href="#"
                    style={{ color: "#adb5bd", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) => (e.target.style.color = "#adb5bd")}
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>
              Hỗ trợ
            </h6>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}
            >
              {[
                "Câu hỏi thường gặp",
                "Chính sách đổi trả",
                "Liên hệ chúng tôi",
                "Điều khoản sử dụng",
              ].map((c) => (
                <li key={c} style={{ marginBottom: 6 }}>
                  <a
                    href="#"
                    style={{ color: "#adb5bd", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) => (e.target.style.color = "#adb5bd")}
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #2d2d4e",
            paddingTop: 16,
            fontSize: 12,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>
            &copy; {new Date().getFullYear()} Digital Books. All rights
            reserved.
          </span>
          <div className="d-flex gap-3">
            {["bi-facebook", "bi-twitter-x", "bi-instagram"].map((ic) => (
              <a
                key={ic}
                href="#"
                style={{ color: "#adb5bd" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#adb5bd")}
              >
                <i className={`bi ${ic}`} style={{ fontSize: 16 }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Layout wrapper ────────────────────────────────────────────────────────────
export default function UserLayout({ user, onLogout, onShowLogin, children }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    getCart()
      .then((res) => setCartCount(res.data.length))
      .catch(() => setCartCount(0));
  }, [user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8f9fa",
      }}
    >
      <Navbar
        user={user}
        onLogout={onLogout}
        onShowLogin={onShowLogin}
        cartCount={cartCount}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
