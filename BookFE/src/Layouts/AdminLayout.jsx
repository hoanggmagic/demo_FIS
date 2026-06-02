import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    header: "Tổng quan",
    items: [{ label: "Dashboard", icon: "bi bi-speedometer2", to: "/" }],
  },
  {
    header: "Quản lý",
    items: [
      { label: "Sách", icon: "bi bi-book", to: "/admin/books" },
      {
        label: "Giảm giá",
        icon: "bi bi-ticket-detailed",
        to: "/admin/discounts",
      },
      { label: "Danh mục", icon: "bi bi-tags", to: "/admin/categories" },
      { label: "Tác giả", icon: "bi bi-person-badge", to: "/admin/authors" },
      { label: "Người dùng", icon: "bi bi-people", to: "/admin/users" },
      { label: "Đơn hàng", icon: "bi bi-cart3", to: "/admin/orders" },
      { label: "Chi nhánh", icon: "bi bi-shop", to: "/admin/branches" },
      { label: "Tồn kho", icon: "bi bi-boxes", to: "/admin/inventory" },
      {
        label: "Điều chuyển",
        icon: "bi bi-arrow-left-right",
        to: "/admin/transfers",
      },
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

function Sidebar({ collapsed, user }) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: "width 0.25s ease",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? "20px 16px" : "20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className="bi bi-journal-bookmark-fill"
            style={{ color: "#fff", fontSize: 16 }}
          />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "-0.3px",
              }}
            >
              Bookfly
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 10,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div
        style={{
          padding: collapsed ? "12px 16px" : "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {user.fullName?.charAt(0)?.toUpperCase() ?? "A"}
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: "#f1f5f9",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.fullName}
            </div>
            <div
              style={{
                color: "#6366f1",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Quản trị viên
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {NAV_ITEMS.map((group) => (
          <React.Fragment key={group.header}>
            {!collapsed && (
              <div
                style={{
                  padding: "12px 20px 4px",
                  color: "#475569",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {group.header}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 16px" : "9px 16px 9px 20px",
                  margin: "1px 8px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: isActive
                    ? "rgba(99,102,241,0.15)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #6366f1"
                    : "3px solid transparent",
                  transition: "all 0.15s",
                  color: isActive ? "#a5b4fc" : "#94a3b8",
                })}
                onMouseEnter={(e) => {
                  if (
                    !e.currentTarget.style.borderLeftColor.includes(
                      "99,102,241,1",
                    )
                  ) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.getAttribute("aria-current");
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                <i
                  className={item.icon}
                  style={{ fontSize: 16, flexShrink: 0 }}
                />
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
            ))}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}

function Topbar({ user, onToggle, onLogout }) {
  const navigate = useNavigate();
  const [ddOpen, setDdOpen] = useState(false);

  return (
    <header
      style={{
        height: 56,
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          width: 36,
          height: 36,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <i className="bi bi-list" style={{ fontSize: 20 }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notification */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            width: 36,
            height: 36,
            borderRadius: 8,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          <i className="bi bi-bell" style={{ fontSize: 18 }} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid #fff",
            }}
          />
        </button>

        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDdOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {user.fullName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
              {user.fullName}
            </span>
            <i
              className="bi bi-chevron-down"
              style={{ fontSize: 11, color: "#94a3b8" }}
            />
          </button>

          {ddOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                minWidth: 180,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                >
                  {user.fullName}
                </div>
                <div
                  style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}
                >
                  Quản trị viên
                </div>
              </div>
              <button
                onClick={() => {
                  setDdOpen(false);
                  navigate("/admin/settings");
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <i className="bi bi-gear" /> Cài đặt
              </button>
              <div style={{ borderTop: "1px solid #f1f5f9" }} />
              <button
                onClick={onLogout}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#ef4444",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <i className="bi bi-box-arrow-right" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ user, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
      <Sidebar collapsed={collapsed} user={user} />

      {/* Main */}
      <div
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          transition: "margin-left 0.25s ease",
          minWidth: 0,
        }}
      >
        <Topbar
          user={user}
          onToggle={() => setCollapsed((v) => !v)}
          onLogout={onLogout}
        />

        {/* Banner */}
        <div style={{ padding: "24px 24px 0" }}>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              padding: "32px 40px",
              marginBottom: 24,
            }}
          >
            {/* Decorations */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
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
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 200,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />

            <div style={{ position: "relative", zIndex: 2 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  marginBottom: 12,
                }}
              >
                <i
                  className="bi bi-journal-bookmark-fill"
                  style={{ color: "#fff", fontSize: 12 }}
                />
                <span
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  BOOKFLY ADMIN
                </span>
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 26,
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                }}
              >
                Xin chào, {user.fullName} 👋
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Quản lý sách, người dùng, đơn hàng và doanh thu từ bảng điều
                khiển.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "0 24px 24px" }}>{children}</div>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            © {new Date().getFullYear()}{" "}
            <strong style={{ color: "#6366f1" }}>Bookfly</strong> — Digital Book
            Platform
          </span>
          <span style={{ fontSize: 12, color: "#cbd5e1" }}>
            All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
}
