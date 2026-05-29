import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCart } from "../Api/User/CartApi";
import { categoryApi } from "../Api/Admin/CategoryApi";

// ── Category Mega Menu ────────────────────────────────────────────────────────
function CategoryMenu({ onSelect }) {
  const [tree, setTree] = useState([]);
  const [activeParent, setActiveParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    categoryApi
      .getTree()
      .then(setTree)
      .catch(() => setTree([]));
  }, []);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveParent(null);
        setActiveChild(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!tree.length) return null;

  const colStyle = (active) => ({
    minWidth: 200,
    padding: "8px 0",
    borderRight: active ? "1px solid #f0f0f0" : "none",
  });

  const itemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#2563eb" : "#1e293b",
    background: isActive ? "#eff6ff" : "transparent",
    borderRadius: 6,
    margin: "0 6px",
    transition: "all .15s",
  });

  return (
    <li className="nav-item position-relative" ref={ref}>
      <button
        className="nav-link fw-medium text-dark d-flex align-items-center gap-1"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        onClick={() => {
          setOpen((v) => !v);
          setActiveParent(null);
          setActiveChild(null);
        }}
      >
        <i className="bi bi-tags me-1" /> Danh mục
        <i
          className={`bi bi-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 10 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 2000,
            background: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,.12)",
            display: "flex",
            minWidth: 220,
          }}
        >
          {/* ── Cột cấp 1 (cha) ── */}
          <div style={colStyle(!!activeParent)}>
            {tree.map((cat) => (
              <div
                key={cat.id}
                style={itemStyle(activeParent?.id === cat.id)}
                onMouseEnter={() => {
                  setActiveParent(cat);
                  setActiveChild(null); // reset cấp 3 khi hover sang cha khác
                }}
                onClick={() => {
                  onSelect(cat);
                  setOpen(false);
                  setActiveParent(null);
                  setActiveChild(null);
                }}
              >
                <span>
                  <i
                    className="bi bi-tag me-2"
                    style={{ fontSize: 11, color: "#94a3b8" }}
                  />
                  {cat.name}
                </span>
                {cat.children?.length > 0 && (
                  <i
                    className="bi bi-chevron-right"
                    style={{ fontSize: 10, color: "#94a3b8" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Cột cấp 2 (con) ── */}
          {activeParent?.children?.length > 0 && (
            <div style={colStyle(!!activeChild)}>
              {/* Label cha */}
              <div
                style={{
                  padding: "6px 16px 8px",
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {activeParent.name}
              </div>

              {activeParent.children.map((child) => (
                <div
                  key={child.id}
                  style={itemStyle(activeChild?.id === child.id)}
                  onMouseEnter={() => setActiveChild(child)}
                  onClick={() => {
                    onSelect(child);
                    setOpen(false);
                    setActiveParent(null);
                    setActiveChild(null);
                  }}
                >
                  <span>
                    <i
                      className="bi bi-arrow-return-right me-2"
                      style={{ fontSize: 11, color: "#94a3b8" }}
                    />
                    {child.name}
                  </span>
                  {child.children?.length > 0 && (
                    <i
                      className="bi bi-chevron-right"
                      style={{ fontSize: 10, color: "#94a3b8" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Cột cấp 3 (cháu) ── */}
          {activeChild?.children?.length > 0 && (
            <div style={colStyle(false)}>
              {/* Label con */}
              <div
                style={{
                  padding: "6px 16px 8px",
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {activeChild.name}
              </div>

              {activeChild.children.map((grandchild) => (
                <div
                  key={grandchild.id}
                  style={{
                    padding: "9px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1e293b",
                    borderRadius: 6,
                    margin: "0 6px",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eff6ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    onSelect(grandchild);
                    setOpen(false);
                    setActiveParent(null);
                    setActiveChild(null);
                  }}
                >
                  <i
                    className="bi bi-dot me-1"
                    style={{ fontSize: 16, color: "#94a3b8" }}
                  />
                  {grandchild.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout, onShowLogin, cartCount, onSelectCategory }) {
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

            {/* ← Category menu */}
            <CategoryMenu onSelect={onSelectCategory} />

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

          {/* User area — giữ nguyên */}
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryApi
      .getTree()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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

          {/* ── Danh mục động từ API ── */}
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>
              Danh mục
            </h6>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}
            >
              {categories.map((cat) => (
                <li key={cat.id} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => {
                      // Collect ids của cat + children
                      const collectIds = (node) => {
                        const ids = [node.id];
                        node.children?.forEach((c) =>
                          ids.push(...collectIds(c)),
                        );
                        return ids;
                      };
                      const ids = collectIds(cat);
                      navigate(
                        `/?categoryIds=${ids.join(",")}&categoryName=${encodeURIComponent(cat.name)}`,
                      );
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#adb5bd",
                      fontSize: 13,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#adb5bd")
                    }
                  >
                    {cat.name}
                  </button>
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    getCart()
      .then((res) => setCartCount(res.data.length))
      .catch(() => setCartCount(0));
  }, [user]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);

    // Thu thập id của cat + toàn bộ children (đệ quy)
    const collectIds = (node) => {
      const ids = [node.id];
      if (node.children?.length) {
        node.children.forEach((child) => ids.push(...collectIds(child)));
      }
      return ids;
    };

    const ids = collectIds(cat);

    navigate(
      `/?categoryIds=${ids.join(",")}&categoryName=${encodeURIComponent(cat.name)}`,
    );
  };

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
        onSelectCategory={handleSelectCategory}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
