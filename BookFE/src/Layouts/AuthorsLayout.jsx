import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "admin-lte/dist/css/adminlte.min.css";

const AUTHOR_NAV = [
  {
    header: "Quản lý",
    items: [{ label: "Sách của tôi", icon: "bi bi-book", to: "/author/books" }],
  },
  {
    header: "Tài khoản",
    items: [
      { label: "Hồ sơ", icon: "bi bi-person", to: "/author/profile" },
      { label: "Ví", icon: "bi bi-wallet2", to: "/author/wallet" },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, user }) {
  return (
    <aside
      className="app-sidebar bg-body-secondary shadow"
      data-bs-theme="dark"
    >
      <div className="sidebar-brand">
        <NavLink to="/author/books" className="brand-link">
          <i
            className="bi bi-pencil-square brand-image"
            style={{ fontSize: 24, color: "#3b7ddd" }}
          />
          {!collapsed && (
            <span className="brand-text fw-bold ms-2">Author Panel</span>
          )}
        </NavLink>
      </div>

      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <div
            className="user-panel mt-2 pb-2 mb-2 d-flex align-items-center"
            style={{
              borderBottom: "1px solid rgba(255,255,255,.1)",
              padding: "0 12px 8px",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
              style={{ width: 36, height: 36, fontWeight: 600, fontSize: 14 }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="ms-2 overflow-hidden">
                <p
                  className="mb-0 text-white"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.fullName}
                </p>
                <span className="badge bg-info" style={{ fontSize: 10 }}>
                  Author
                </span>
              </div>
            )}
          </div>

          <ul className="nav sidebar-menu flex-column">
            {AUTHOR_NAV.map((group) => (
              <React.Fragment key={group.header}>
                {!collapsed && (
                  <li
                    className="nav-header"
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: ".7px",
                      color: "#8898aa",
                      listStyle: "none",
                    }}
                  >
                    {group.header}
                  </li>
                )}
                {group.items.map((item) => (
                  <li className="nav-item" key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link${isActive ? " active" : ""}`
                      }
                    >
                      <i className={`${item.icon} nav-icon`} />
                      {!collapsed && <p>{item.label}</p>}
                    </NavLink>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ onToggle, user, onLogout }) {
  return (
    <nav
      className="app-header navbar navbar-expand bg-body"
      data-bs-theme="light"
      style={{
        height: 50,
        position: "sticky",
        top: 0,
        zIndex: 1030,
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <button className="btn btn-link text-dark p-0" onClick={onToggle}>
          <i className="bi bi-list fs-4" />
        </button>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{
                width: 32,
                height: 32,
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {user?.fullName}
            </span>
          </div>
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right" /> Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="app-footer"
      style={{
        borderTop: "1px solid #dee2e6",
        padding: "12px 20px",
        fontSize: 12,
        color: "#6c757d",
      }}
    >
      <span style={{ float: "right" }}>Author Dashboard</span>
      <strong>&copy; {new Date().getFullYear()} Digital Books</strong>
    </footer>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AuthorLayout({ children, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`layout-fixed sidebar-expand-lg${collapsed ? " sidebar-collapse" : ""}`}
    >
      <Sidebar collapsed={collapsed} user={user} />

      <div className="content-wrapper" style={{ paddingTop: 0 }}>
        {/* Topbar — nằm trực tiếp trong content-wrapper, TRƯỚC main */}
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <main className="app-main" style={{ margin: 0 }}>
          {/* Hero banner */}
          <div
            className="app-content-header"
            style={{ padding: 20, paddingBottom: 0 }}
          >
            <div
              className="rounded-4 shadow-sm overflow-hidden position-relative"
              style={{
                height: 200,
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
              }}
            >
              <div
                className="h-100 d-flex flex-column justify-content-center"
                style={{
                  padding: "32px 40px",
                  color: "white",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "white",
                  }}
                >
                  Welcome, {user?.fullName} ✍️
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    opacity: 0.9,
                    maxWidth: 500,
                    margin: 0,
                  }}
                >
                  Manage your books, profile and earnings.
                </p>
                <button
                  className="btn btn-light mt-3 d-flex align-items-center gap-2"
                  style={{
                    width: "fit-content",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                  onClick={() => navigate("/author/books")}
                >
                  <i className="bi bi-book" /> Sách của tôi
                </button>
              </div>
              {/* Decorations */}
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  right: 120,
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
            </div>
          </div>

          {/* Page content */}
          <div className="app-content" style={{ padding: 20 }}>
            <div className="container-fluid">{children}</div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
