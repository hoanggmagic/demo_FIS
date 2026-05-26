import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import RegisterAuthor from "./Components/Auth/RegisterAuthor";
import UserPage from "./Page/User/UserPage";
import AdminPage from "./Page/Admin/AdminPage";
import AuthorsPage from "./Page/Authors/AuthorsPage";
import Payment from "./Components/User/Payment";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (!token) {
      setLoading(false);
      return;
    }
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
    navigate("/");
  };

  if (loading) return <div>Đang tải...</div>;

  if (!user) {
    if (page === "login")
      return (
        <Login
          onSuccess={setUser}
          goToRegister={() => setPage("register")}
          goToRegisterAuthor={() => setPage("register-author")}
        />
      );
    if (page === "register")
      return <Register goToLogin={() => setPage("login")} />;
    if (page === "register-author")
      return <RegisterAuthor goToLogin={() => setPage("login")} />;
  }

  const roleLabel = { ADMIN: "Quản trị", AUTHOR: "Tác giả", USER: "Người mua" }[
    user?.role
  ];

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>📚 Digital Book Platformvv</h1>
          <p className="user-badge">
            {user.fullName} ·{" "}
            <span className={`role role-${user.role}`}>{roleLabel}</span>
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              {user.role === "ADMIN" && <AdminPage user={user} />}
              {user.role === "AUTHOR" && <AuthorsPage user={user} />}
              {user.role === "USER" && <UserPage user={user} />}
            </>
          }
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
