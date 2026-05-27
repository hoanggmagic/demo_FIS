import { useLocation } from "react-router-dom";
import BookManagement from "../../Components/Admin/BookManagement";
import AuthorManagement from "../../Components/Admin/AuthorManagement";
import Profile from "../../Components/Authors/profile";
import Wallet from "../../Components/Authors/Wallet";

export default function AuthorsPage({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  return (
    <div className="card shadow-sm p-4 bg-white rounded-3">
      {/* 1. Nếu ở trang chủ "/" hoặc "/author/books" -> Hiện Quản lý Sách */}
      {(currentPath === "/" || currentPath === "/author/books") && (
        <BookManagement user={user} />
      )}

      {/* 2. Nếu là Admin và vào path authors (dành cho trường hợp mở rộng sau này) */}
      {currentPath === "/author/authors" && isAdmin && (
        <AuthorManagement user={user} />
      )}

      {/* 3. Nếu là Author và vào đường dẫn profile */}
      {currentPath === "/author/profile" && isAuthor && <Profile />}

      {/* 4. Nếu là Author và vào đường dẫn wallet */}
      {currentPath === "/author/wallet" && isAuthor && <Wallet />}
    </div>
  );
}
