import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import RegisterAuthor from "./RegisterAuthor";
import ForgotPassword from "./ForgotPassword";

const PAGES = {
  login: Login,
  register: Register,
  "register-author": RegisterAuthor,
  "forgot-password": ForgotPassword,
};

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryPage = new URLSearchParams(location.search).get("page");
  const pathPage =
    location.pathname === "/register"
      ? "register"
      : location.pathname === "/register-author"
        ? "register-author"
        : location.pathname === "/forgot-password"
          ? "forgot-password"
          : "login";
  const page = queryPage || pathPage;
  const fromPath =
    location.state?.from || sessionStorage.getItem("auth_return_to") || "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) return;
    if (page === "login" || page === "register" || page === "register-author") {
      const parsed = JSON.parse(user);
      const role = parsed?.role?.toUpperCase();
      if (role === "ADMIN") {
        navigate("/", { replace: true });
      } else if (role === "AUTHOR") {
        navigate("/author/books", { replace: true });
      } else if (role === "USER") {
        navigate(fromPath || "/", { replace: true });
      }
    }
  }, [fromPath, navigate, page]);

  const goTo = (nextPage) => {
    navigate(`/login?page=${nextPage}`, {
      replace: true,
      state: location.state,
    });
  };

  const handleSuccess = (user) => {
    onLogin(user);
    sessionStorage.removeItem("auth_return_to");

    const role = user?.role?.toUpperCase();
    if (role === "USER") {
      navigate(fromPath || "/", { replace: true });
      return;
    }

    if (role === "AUTHOR") {
      navigate("/author/books", { replace: true });
      return;
    }

    if (role === "ADMIN") {
      navigate("/", { replace: true });
    }
  };

  const Page = PAGES[page] || Login;

  return (
    <div className="d-flex align-items-center justify-content-center py-3">
      <div
        className="shadow-lg"
        style={{
          width: "min(100%, 980px)",
          borderRadius: 28,
          overflow: "hidden",
          background: "#fff",
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          minHeight: 560,
        }}
      >
        <div
          className="d-none d-lg-flex flex-column justify-content-between p-5"
          style={{
            background:
              "linear-gradient(160deg, #0f172a 0%, #1d4ed8 45%, #38bdf8 100%)",
            color: "#fff",
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-4">
              <i className="bi bi-book-half" style={{ fontSize: 28 }} />
              <div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>Digital Books</div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>Đăng nhập</div>
              </div>
            </div>
            <h2 style={{ fontWeight: 800, lineHeight: 1.2, maxWidth: 420 }}>
              Truy cập kho sách, lịch sử mua hàng và khu vực cá nhân của bạn.
            </h2>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 20,
              background: "rgba(255,255,255,.12)",
              backdropFilter: "blur(8px)",
            }}
          ></div>
        </div>

        <div className="p-4 p-lg-5 d-flex align-items-center justify-content-center">
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div
                  className="text-primary fw-semibold"
                  style={{ fontSize: 13 }}
                >
                  Tài khoản
                </div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                  {page === "login"
                    ? "Đăng nhập"
                    : page === "register"
                      ? "Tạo tài khoản"
                      : page === "register-author"
                        ? "Đăng ký tác giả"
                        : "Quên mật khẩu"}
                </h1>
              </div>
              <button
                className="btn btn-light rounded-circle"
                style={{ width: 42, height: 42 }}
                onClick={() => navigate("/", { replace: true })}
                aria-label="Đóng"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <Page
              onSuccess={handleSuccess}
              goToLogin={() => goTo("login")}
              goToRegister={() => goTo("register")}
              goToRegisterAuthor={() => goTo("register-author")}
              goToForgotPassword={() => goTo("forgot-password")}
            />

            <div className="mt-4 text-center">
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => navigate("/", { replace: true })}
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
