import { useLocation, useNavigate } from "react-router-dom";
import BookManagement from "../../Components/Admin/BookManagement";
import AuthorManagement from "../../Components/Admin/AuthorManagement";
import Profile from "../../Components/Authors/profile";
import Wallet from "../../Components/Authors/Wallet";

export default function AuthorsPage({ user, defaultTab }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  return (
    <div className="card shadow-sm p-4 bg-white rounded-3">
      {(currentPath === "/" ||
        currentPath === "/author/books" ||
        defaultTab === "books") && <BookManagement user={user} />}

      {currentPath === "/author/authors" && isAdmin && (
        <AuthorManagement user={user} />
      )}

      {(currentPath === "/author/profile" || defaultTab === "profile") &&
        isAuthor && <Profile />}

      {(currentPath === "/author/wallet" || defaultTab === "wallet") &&
        isAuthor && <Wallet />}
    </div>
  );
}
