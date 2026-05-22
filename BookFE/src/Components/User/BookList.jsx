import { useEffect, useState } from "react";
import { getBooks, searchBooks } from "../../Api/User/BookApi";
import { addToCart } from "../../Api/User/CartApi";
import "../../Style/User/BookList.css";

export default function UserBookList({ onCartUpdate }) {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(null); // bookId đang thêm

  const load = async () => {
    const res = await getBooks();
    setBooks(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) return load();
    const res = await searchBooks(keyword);
    setBooks(res.data);
  };

  const handleAddToCart = async (bookId) => {
    setAdding(bookId);
    try {
      await addToCart(bookId, 1);
      alert("✅ Đã thêm vào giỏ hàng!");
      onCartUpdate?.(); // báo parent reload giỏ hàng
    } catch {
      alert("❌ Không thể thêm vào giỏ hàng!");
    } finally {
      setAdding(null);
    }
  };

  return (
    <section>
      <h3>📚 Danh sách sách</h3>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Tìm</button>
      </div>

      {books.length === 0 ? (
        <p style={{ padding: "20px" }}>Không có sách nào.</p>
      ) : (
        <div className="user-book-grid">
          {books.map((b) => (
            <div key={b.id} className="book-card">
              <h4>{b.title}</h4>
              <span className="author">✍️ {b.authorName || "—"}</span>
              <span className="price">
                {Number(b.price || 0).toLocaleString()} VND
              </span>
              <span className="status">📦 Tồn kho: {b.quantity ?? 0}</span>
              <span className="status">📅 {b.publishedYear}</span>
              <button
                className="btn-add-cart"
                disabled={adding === b.id || b.quantity === 0}
                onClick={() => handleAddToCart(b.id)}
              >
                {adding === b.id
                  ? "Đang thêm..."
                  : b.quantity === 0
                    ? "Hết hàng"
                    : "🛒 Thêm vào giỏ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
