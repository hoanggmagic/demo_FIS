import { useState, useEffect } from "react";
import UserBookList from "../../Components/User/BookList";
import Cart from "../../Components/User/Cart";
import { getCart } from "../../Api/User/CartApi";

export default function UserPage({ user }) {
  const [tab, setTab] = useState("books"); // mặc định vào sách
  const [cartReload, setCartReload] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Đếm số item trong giỏ để hiện badge
  const loadCartCount = async () => {
    try {
      const res = await getCart();
      setCartCount(res.data.length);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, [cartReload]);

  const handleCartUpdate = () => {
    setCartReload((r) => r + 1);
  };

  return (
    <div>
      {/* Header nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "2px solid #eee",
          background: "#fff",
        }}
      >
        <span style={{ flex: 1, fontWeight: "bold", fontSize: 18 }}>
          📖 Nhà sách
        </span>

        {/* Nút Danh sách sách */}
        <button
          onClick={() => setTab("books")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            background: tab === "books" ? "#1976d2" : "#f0f0f0",
            color: tab === "books" ? "#fff" : "#333",
            fontWeight: tab === "books" ? "bold" : "normal",
          }}
        >
          📚 Danh sách sách
        </button>

        {/* Nút Giỏ hàng + badge */}
        <button
          onClick={() => setTab("cart")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            position: "relative",
            background: tab === "cart" ? "#1976d2" : "#f0f0f0",
            color: tab === "cart" ? "#fff" : "#333",
            fontWeight: tab === "cart" ? "bold" : "normal",
          }}
        >
          🛒 Giỏ hàng
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "#e53935",
                color: "#fff",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* Nội dung */}
      {tab === "books" && <UserBookList onCartUpdate={handleCartUpdate} />}
      {tab === "cart" && <Cart reload={cartReload} />}
    </div>
  );
}
