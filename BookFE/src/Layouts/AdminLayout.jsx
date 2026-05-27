import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "admin-lte/dist/css/adminlte.min.css";

// ── nav config ────────────────────────────────────────────────────────────────
// Thêm / bớt menu items tại đây, không cần sửa JSX bên dưới

const NAV_ITEMS = [
  {
    header: "Tổng quan",
    items: [{ label: "Dashboard", icon: "bi bi-speedometer2", to: "/" }],
  },
  {
    header: "Quản lý",
    items: [
      { label: "Sách", icon: "bi bi-book", to: "/admin/books" },
      { label: "Tác giả", icon: "bi bi-person-badge", to: "/admin/authors" },
      { label: "Người dùng", icon: "bi bi-people", to: "/admin/users" },
      { label: "Đơn hàng", icon: "bi bi-cart3", to: "/admin/orders" },
    ],
  },
  {
    header: "Tài chính",
    items: [
      {
        label: "Doanh thu",
        icon: "bi bi-bar-chart-line",
        to: "/admin/revenue",
      },
      {
        label: "Yêu cầu rút tiền",
        icon: "bi bi-credit-card",
        to: "/admin/wallet",
      },
    ],
  },
  {
    header: "Hệ thống",
    items: [{ label: "Cài đặt", icon: "bi bi-gear", to: "/admin/settings" }],
  },
];

// ── sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, user }) {
  return (
    <aside
      className="app-sidebar bg-body-secondary shadow"
      data-bs-theme="dark"
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <a href="/" className="brand-link">
          <i
            className="bi bi-journal-bookmark-fill brand-image"
            style={{ fontSize: 24, color: "#3b7ddd" }}
          />
          {!collapsed && (
            <span className="brand-text fw-bold ms-2">Digital Books</span>
          )}
        </a>
      </div>

      {/* User panel */}
      <div className="sidebar-wrapper">
        <nav className="mt-2">
          {/* User info */}
          <div
            className="user-panel mt-2 pb-2 mb-2 d-flex align-items-center"
            style={{
              borderBottom: "1px solid rgba(255,255,255,.1)",
              padding: "0 12px 8px",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
              style={{ width: 36, height: 36, fontSize: 14, fontWeight: 500 }}
            >
              {user.fullName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            {!collapsed && (
              <div className="ms-2 overflow-hidden">
                <p
                  className="mb-0 text-white"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.fullName}
                </p>
                <span className="badge bg-primary" style={{ fontSize: 10 }}>
                  Quản trị viên
                </span>
              </div>
            )}
          </div>

          {/* Nav items */}
          <ul
            className="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            role="menu"
          >
            {NAV_ITEMS.map((group) => (
              <React.Fragment key={group.header}>
                {!collapsed && (
                  <li
                    className="nav-header"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.7px",
                      textTransform: "uppercase",
                      padding: "12px 16px 4px",
                      color: "#8898aa",
                      listStyle: "none",
                    }}
                  >
                    {group.header}
                  </li>
                )}
                {group.items.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        `nav-link${isActive ? " active" : ""}`
                      }
                    >
                      <i
                        className={`${item.icon} nav-icon`}
                        aria-hidden="true"
                      />
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

// ── topbar ────────────────────────────────────────────────────────────────────

function Topbar({ user, onToggle, onLogout }) {
  const navigate = useNavigate();
  const [ddOpen, setDdOpen] = useState(false);

  return (
    <nav
      className="app-header navbar navbar-expand bg-body px-3"
      data-bs-theme="light"
      style={{
        height: "50px",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <div
        className="container-fluid d-flex align-items-center justify-content-between"
        style={{ height: "50px" }}
      >
        {/* Toggle sidebar */}
        <ul className="navbar-nav align-items-center">
          <li className="nav-item">
            <button
              type="button"
              className="nav-link py-0 d-flex align-items-center"
              onClick={onToggle}
              aria-label="Toggle sidebar"
            >
              <i
                className="bi bi-list"
                style={{ fontSize: 20 }}
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>

        {/* Right side */}
        <ul className="navbar-nav ms-auto align-items-center">
          {/* Notifications */}
          <li className="nav-item">
            <button
              type="button"
              className="nav-link position-relative"
              aria-label="Thông báo"
            >
              <i
                className="bi bi-bell"
                style={{ fontSize: 18 }}
                aria-hidden="true"
              />
              <span
                className="position-absolute bg-danger rounded-circle"
                style={{ width: 8, height: 8, top: 8, right: 8 }}
              />
            </button>
          </li>

          {/* User dropdown */}
          <li className="nav-item dropdown">
            <button
              type="button"
              className="nav-link py-0 d-flex align-items-center gap-2"
              onClick={() => setDdOpen((v) => !v)}
              aria-expanded={ddOpen}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {user.fullName?.charAt(0)?.toUpperCase() ?? "A"}
              </div>
              <span style={{ fontSize: 13 }}>{user.fullName}</span>
              <i
                className="bi bi-chevron-down"
                style={{ fontSize: 11 }}
                aria-hidden="true"
              />
            </button>

            {ddOpen && (
              <ul
                className="dropdown-menu dropdown-menu-end show"
                style={{ minWidth: 180 }}
              >
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => {
                      setDdOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    <i className="bi bi-gear" aria-hidden="true" /> Cài đặt
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={onLogout}
                  >
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />{" "}
                    Đăng xuất
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ── footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="app-footer">
      <div className="float-end d-none d-sm-inline">Digital Book Platform</div>
      <strong>
        &copy; {new Date().getFullYear()}{" "}
        <a href="/" className="text-decoration-none">
          Admin Panel
        </a>
        .
      </strong>{" "}
      <span className="text-muted" style={{ fontSize: 12 }}>
        All rights reserved.
      </span>
    </footer>
  );
}

// ── layout wrapper ────────────────────────────────────────────────────────────

export default function AdminLayout({ user, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`layout-fixed sidebar-expand-lg${collapsed ? " sidebar-collapse" : ""}`}
    >
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} user={user} />

      {/* Wrapper */}
      <div className="app-wrapper">
        {/* Topbar */}
        <Topbar
          user={user}
          onToggle={() => setCollapsed((v) => !v)}
          onLogout={onLogout}
        />

        {/* Content */}
        <main className="app-main">
          <div className="app-content-header">
            <div
              className="rounded-4 shadow-sm overflow-hidden position-relative"
              style={{
                height: "220px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
              }}
            >
              <div
                className="h-100 d-flex flex-column justify-content-center"
                style={{
                  padding: "40px",
                  color: "white",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  Welcome back 👋
                </h1>

                <p
                  style={{
                    fontSize: "15px",
                    opacity: 0.9,
                    maxWidth: "600px",
                  }}
                >
                  Manage books, users, orders and revenue from your dashboard.
                </p>

                <button
                  className="btn btn-light mt-3"
                  style={{
                    width: "fit-content",
                    fontWeight: 600,
                  }}
                >
                  View Analytics
                </button>
              </div>

              {/* Decorations */}
              <div
                style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: "-40px",
                  right: "120px",
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
            </div>
          </div>
          <div className="app-content">
            <div className="container-fluid">{children}</div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
