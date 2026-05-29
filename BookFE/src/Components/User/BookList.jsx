import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBooks, searchBooks } from "../../Api/User/BookApi";
import { addToCart } from "../../Api/User/CartApi";
import BranchPickerModal from "./BranchPickerModal";

const PAGE_SIZE = 12; // 4 cột × 3 hàng

export default function UserBookList({ user, onShowLogin, onCartUpdate }) {
  const [allBooks, setAllBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickingBook, setPickingBook] = useState(null); //chon chi nhanh de lay sach

  const categoryIdsParam = searchParams.get("categoryIds");
  const categoryName = searchParams.get("categoryName");
  const categoryIds = categoryIdsParam
    ? categoryIdsParam.split(",").map(Number)
    : [];

  // Filter client-side theo categoryIds
  const filtered =
    categoryIds.length > 0
      ? allBooks.filter((b) => categoryIds.includes(b.category?.id))
      : allBooks;

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const books = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      setAllBooks(data);
      setPage(1);
    } catch {
      setAllBooks([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    setKeyword("");
    setPage(1);
  }, [categoryIdsParam]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = () => load();

  // Thay toàn bộ handleAddToCart cũ:
  const handleAddToCart = (book) => {
    if (!user) {
      onShowLogin?.();
      return;
    }
    setPickingBook(book); // mở modal chọn chi nhánh
  };

  const handleBranchConfirm = async (branchId) => {
    const book = pickingBook;
    setPickingBook(null);
    setAdding(book.id);
    try {
      await addToCart(book.id, 1);
      onCartUpdate?.();
    } catch {
      alert("❌ Không thể thêm vào giỏ hàng!");
    } finally {
      setAdding(null);
    }
  };
  const clearCategory = () => {
    setSearchParams({});
    setPage(1);
  };

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
      {!loading && filtered.length === 0 && (
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

      {/* Grid sách — 4 cột × 3 hàng */}
      {!loading && books.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Cover */}
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

              {b.category && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    borderRadius: 20,
                    padding: "2px 8px",
                    alignSelf: "flex-start",
                  }}
                >
                  {b.category.name}
                </span>
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

              <span
                style={{
                  fontSize: 11,
                  color: b.quantity === 0 ? "#ef4444" : "#64748b",
                }}
              >
                📦 {b.quantity === 0 ? "Hết hàng" : `Còn ${b.quantity}`}
              </span>

              <button
                disabled={adding === b.id || b.quantity === 0}
                onClick={() => handleAddToCart(b)}
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
                  opacity: adding === b.id ? 0.7 : 1,
                  transition: "opacity .15s",
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 32,
          }}
        >
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: page === 1 ? "#f8fafc" : "#fff",
              color: page === 1 ? "#cbd5e1" : "#1e293b",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="bi bi-chevron-left" />
          </button>

          {/* Page numbers với dấu ... */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
            )
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "..." ? (
                <span
                  key={`dots-${idx}`}
                  style={{ color: "#94a3b8", fontSize: 13, padding: "0 4px" }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: p === page ? "none" : "1px solid #e2e8f0",
                    background:
                      p === page
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : "#fff",
                    color: p === page ? "#fff" : "#1e293b",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: p === page ? 700 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      p === page ? "0 2px 8px rgba(37,99,235,.3)" : "none",
                  }}
                >
                  {p}
                </button>
              ),
            )}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: page === totalPages ? "#f8fafc" : "#fff",
              color: page === totalPages ? "#cbd5e1" : "#1e293b",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {/* Tổng số kết quả */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Hiển thị {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} sách
        </div>
      )}
      <BranchPickerModal
        book={pickingBook}
        onConfirm={handleBranchConfirm}
        onClose={() => setPickingBook(null)}
      />
    </section>
  );
}
