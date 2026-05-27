import BookManagement from "../../Components/Admin/BookManagement";
import AuthorManagement from "../../Components/Admin/AuthorManagement";
import AdminWallet from "../../Components/Admin/AdminWallet";
import UserManagement from "../../Components/Admin/UserManagement";

// ── Dashboard overview (route "/") ───────────────────────────────────────────

function DashboardHome({ user }) {
  const cards = [
    {
      label: "Quản lý sách",
      icon: "bi bi-book",
      color: "#3b7ddd",
      to: "/admin/books",
    },
    {
      label: "Quản lý tác giả",
      icon: "bi bi-person-badge",
      color: "#28a745",
      to: "/admin/authors",
    },
    {
      label: "Quản lý người dùng",
      icon: "bi bi-people",
      color: "#fd7e14",
      to: "/admin/users",
    },
    {
      label: "Yêu cầu rút tiền",
      icon: "bi bi-wallet2",
      color: "#6f42c1",
      to: "/admin/wallet",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 600, margin: "0 0 4px" }}>
          Xin chào, {user.fullName} 👋
        </h4>
        <p style={{ color: "#6c757d", margin: 0, fontSize: 14 }}>
          Đây là tổng quan hệ thống Digital Book Platform.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((c) => (
          <a
            key={c.to}
            href={c.to}
            style={{ textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", c.to);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "20px 16px",
                border: "1px solid #e9ecef",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "box-shadow .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: c.color + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className={c.icon}
                  style={{ fontSize: 24, color: c.color }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333",
                  textAlign: "center",
                }}
              >
                {c.label}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Page wrapper với title ────────────────────────────────────────────────────

function PageShell({ title, icon, children }) {
  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <i className={icon} style={{ fontSize: 22, color: "#3b7ddd" }} />
        <h5 style={{ margin: 0, fontWeight: 600 }}>{title}</h5>
      </div>
      {children}
    </div>
  );
}

// ── Exports cho từng route ────────────────────────────────────────────────────

export default function AdminPage({ user }) {
  return <DashboardHome user={user} />;
}

export function AdminBooksPage({ user }) {
  return (
    <PageShell title="Quản lý sách" icon="bi bi-book">
      <BookManagement user={user} />
    </PageShell>
  );
}

export function AdminAuthorsPage({ user }) {
  return (
    <PageShell title="Quản lý tác giả" icon="bi bi-person-badge">
      <AuthorManagement user={user} />
    </PageShell>
  );
}

export function AdminUsersPage() {
  return (
    <PageShell title="Quản lý người dùng" icon="bi bi-people">
      <UserManagement />
    </PageShell>
  );
}

export function AdminWalletPage() {
  return (
    <PageShell title="Yêu cầu rút tiền" icon="bi bi-wallet2">
      <AdminWallet />
    </PageShell>
  );
}
