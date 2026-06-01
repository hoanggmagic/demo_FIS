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
      className="app-sidebar shadow"
      style={{
        // Đồng bộ màu background gradient sâu từ layout Admin
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        transition: "width 0.25s ease, transform 0.25s ease",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand Header */}
      <div
        className="sidebar-brand"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <NavLink
          to="/author/books"
          className="brand-link p-0 d-flex align-items-center text-decoration-none"
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            }}
          >
            <i
              className="bi bi-pencil-square text-white"
              style={{ fontSize: 16 }}
            />
          </div>
          {!collapsed && (
            <div className="ms-3 d-flex flex-column">
              <span
                className="brand-text fw-bold text-white lh-sm"
                style={{ fontSize: 15, letterSpacing: "-0.3px" }}
              >
                Bookfly
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "#94a3b8",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Author Panel
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* User Info Container */}
      <div className="sidebar-wrapper">
        <nav className="mt-3">
          <div
            className="user-panel mx-2 pb-3 mb-3 d-flex align-items-center"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "0 12px",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm text-white fw-bold"
              style={{
                width: 36,
                height: 36,
                fontSize: 14,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="ms-3 overflow-hidden">
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
                <span
                  className="badge mt-1"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: "rgba(124, 58, 237, 0.2)",
                    color: "#a78bfa",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                  }}
                >
                  TÁC GIẢ
                </span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <ul className="nav sidebar-menu flex-column px-2">
            {AUTHOR_NAV.map((group) => (
              <React.Fragment key={group.header}>
                {!collapsed && (
                  <li
                    className="nav-header px-3 pt-3 pb-2"
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#475569",
                      fontWeight: 700,
                      listStyle: "none",
                    }}
                  >
                    {group.header}
                  </li>
                )}
                {group.items.map((item) => (
                  <li
                    className="nav-item mb-1"
                    key={item.to}
                    style={{ listStyle: "none" }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center gap-2 rounded-3 ${isActive ? "active" : ""}`
                      }
                      style={({ isActive }) => ({
                        padding: collapsed ? "10px 14px" : "9px 16px",
                        color: isActive ? "#c084fc" : "#94a3b8",
                        background: isActive
                          ? "rgba(124, 58, 237, 0.15)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid #7c3aed"
                          : "3px solid transparent",
                        transition: "all 0.15s ease",
                      })}
                    >
                      <i className={`${item.icon}`} style={{ fontSize: 16 }} />
                      {!collapsed && (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </span>
                      )}
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
      className="app-header navbar navbar-expand bg-white"
      style={{
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 1030,
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        padding: "0 24px",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center p-0">
        <button
          className="btn p-0 d-flex align-items-center justify-content-center"
          onClick={onToggle}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            color: "#64748b",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <i className="bi bi-list fs-5" />
        </button>

        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center gap-2 border px-3 py-1 rounded-3"
            style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
          >
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: 28,
                height: 28,
                fontSize: 12,
                flexShrink: 0,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
              {user?.fullName}
            </span>
          </div>
          <button
            className="btn btn-sm d-flex align-items-center gap-2 rounded-3"
            style={{
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 500,
              color: "#ef4444",
              border: "1px solid #fecaca",
              background: "#fef2f2",
            }}
            onClick={onLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fef2f2";
            }}
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
      className="app-footer bg-white"
      style={{
        borderTop: "1px solid #e2e8f0",
        padding: "16px 24px",
        fontSize: 13,
        color: "#94a3b8",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>
        &copy; {new Date().getFullYear()}{" "}
        <strong style={{ color: "#7c3aed" }}>Bookfly</strong> — Digital Book
        Platform
      </span>
      <span style={{ fontSize: 12, color: "#cbd5e1" }}>Author Dashboard</span>
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
      style={{ minHeight: "100vh", background: "#f8fafc" }}
    >
      <Sidebar collapsed={collapsed} user={user} />

      <div
        className="content-wrapper"
        style={{
          paddingTop: 0,
          background: "#f8fafc",
          transition: "margin-left 0.25s ease",
        }}
      >
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <main className="app-main" style={{ margin: 0 }}>
          {/* Hero banner */}
          <div
            className="app-content-header"
            style={{ padding: "24px 24px 0" }}
          >
            <div
              className="shadow-sm overflow-hidden position-relative"
              style={{
                borderRadius: 16,
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
                padding: "32px 40px",
              }}
            >
              <div style={{ position: "relative", zIndex: 2, color: "white" }}>
                <div
                  className="d-inline-flex align-items-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    marginBottom: 12,
                  }}
                >
                  <i
                    className="bi bi-pencil-fill"
                    style={{ color: "#fff", fontSize: 11 }}
                  />
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    BOOKFLY AUTHOR
                  </span>
                </div>

                <h1
                  className="text-white m-0 fw-bold"
                  style={{ fontSize: 26, letterSpacing: "-0.5px" }}
                >
                  Xin chào, {user?.fullName} 👋
                </h1>
                <p
                  className="mt-1 mb-0"
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}
                >
                  Quản lý tác phẩm, cập nhật hồ sơ cá nhân và theo dõi doanh thu
                  của bạn.
                </p>
              </div>

              {/* Decorative Background Circles */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: 140,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
            </div>
          </div>

          {/* Page content */}
          <div className="app-content" style={{ padding: 24 }}>
            <div className="container-fluid p-0">{children}</div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
