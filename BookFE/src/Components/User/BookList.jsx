import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBooks, searchBooks } from "../../Api/User/BookApi";
import { addToCart } from "../../Api/User/CartApi";

export default function UserBookList({ user, onShowLogin, onCartUpdate }) {
  // ❌ ĐÃ XÓA: const [books, setBooks] = useState([]);  ← đây là nguyên nhân lỗi
  const [allBooks, setAllBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryIdsParam = searchParams.get("categoryIds");
  const categoryName = searchParams.get("categoryName");
  const categoryIds = categoryIdsParam
    ? categoryIdsParam.split(",").map(Number)
    : [];

  // Filter client-side theo categoryIds
  // Backend trả b.categoryIds (mảng số) — nếu không có thì xem ghi chú cuối file
  const books =
    categoryIds.length > 0
      ? allBooks.filter((b) => categoryIds.includes(b.category?.id))
      : allBooks;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await searchBooks(keyword);
      } else {
        res = await getBooks();
      }
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Sample book:", JSON.stringify(data[0], null, 2));
      setAllBooks(data);
    } catch {
      setAllBooks([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);
  // Reset keyword khi đổi category
  useEffect(() => {
    setKeyword("");
  }, [categoryIdsParam]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ handleSearch được khôi phục
  const handleSearch = () => load();

  const handleAddToCart = async (bookId) => {
    if (!user) {
      onShowLogin?.();
      return;
    }
    setAdding(bookId);
    try {
      await addToCart(bookId, 1);
      onCartUpdate?.();
    } catch {
      alert("❌ Không thể thêm vào giỏ hàng!");
    } finally {
      setAdding(null);
    }
  };

  const clearCategory = () => setSearchParams({});

  return (
    <section style={{ padding: "0 0 40px" }}>
      {/* Header + search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            📚 Danh sách sách
          </h3>
          {categoryName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              <i
                className="bi bi-tag-fill"
                style={{ fontSize: 11, color: "#2563eb" }}
              />
              <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>
                {categoryName}
              </span>
              <button
                onClick={clearCategory}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#93c5fd",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: 2,
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
            minWidth: 280,
          }}
        >
          <input
            style={{
              flex: 1,
              border: "none",
              padding: "10px 14px",
              fontSize: 13,
              outline: "none",
              background: "transparent",
              color: "#1e293b",
            }}
            type="text"
            placeholder="Tìm kiếm sách..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              background: "#2563eb",
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <i className="bi bi-search" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          Đang tải...
        </div>
      )}

      {/* Empty */}
      {!loading && books.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#94a3b8",
          }}
        >
          <i
            className="bi bi-inbox"
            style={{ fontSize: 48, display: "block", marginBottom: 12 }}
          />
          <p style={{ margin: 0, fontSize: 15 }}>
            Không có sách nào{categoryName ? ` trong "${categoryName}"` : ""}.
          </p>
          {categoryName && (
            <button
              onClick={clearCategory}
              style={{
                marginTop: 12,
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 13,
                color: "#2563eb",
              }}
            >
              Xem tất cả sách
            </button>
          )}
        </div>
      )}

      {/* Grid sách */}
      {!loading && books.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {books.map((b) => (
            <div
              key={b.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e9ecef",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "box-shadow .2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Cover placeholder */}
              <div
                style={{
                  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                  borderRadius: 8,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <i
                  className="bi bi-book"
                  style={{ fontSize: 36, color: "#93c5fd" }}
                />
              </div>

              <h4
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {b.title}
              </h4>

              <span style={{ fontSize: 12, color: "#64748b" }}>
                ✍️ {b.authorName || "—"}
              </span>

              {/* Category badges */}
              {b.categoryNames && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {b.categoryNames.split(", ").map((name, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: 20,
                        padding: "2px 8px",
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "#dc2626" }}
                >
                  {Number(b.price || 0).toLocaleString()} VND
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  📅 {b.publishedYear}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: b.quantity === 0 ? "#ef4444" : "#64748b",
                  }}
                >
                  📦 {b.quantity === 0 ? "Hết hàng" : `Còn ${b.quantity}`}
                </span>
              </div>

              <button
                disabled={adding === b.id || b.quantity === 0}
                onClick={() => handleAddToCart(b.id)}
                style={{
                  background:
                    b.quantity === 0
                      ? "#f1f5f9"
                      : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: b.quantity === 0 ? "#94a3b8" : "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: b.quantity === 0 ? "not-allowed" : "pointer",
                  transition: "opacity .15s",
                  opacity: adding === b.id ? 0.7 : 1,
                }}
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
