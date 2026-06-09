import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { addToCart } from "../../Api/User/CartApi";
import BranchPickerModal from "./BranchPickerModal";
import BookDetail from "./BookDetail";
import { getBooks } from "../../Api/User/BookApi";

const PAGE_SIZE = 12;
const IMG_BASE = "http://localhost:8080/uploads/books/";

export default function UserBookList({ user, onShowLogin, onCartUpdate }) {
  const [allBooks, setAllBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [adding, setAdding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickingBook, setPickingBook] = useState(null);
  const [detailBookId, setDetailBookId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const page = Number(searchParams.get("page") || "1");
  const books = allBooks;
  const isFirstMount = useRef(true);

  const changePage = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(value));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryIdsParam = searchParams.get("categoryIds");
  const categoryName = searchParams.get("categoryName");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const categoryId = categoryIdsParam
        ? Number(categoryIdsParam.split(",")[0])
        : null;

      const res = await getBooks(
        page - 1,
        PAGE_SIZE,
        submittedKeyword,
        categoryId,
      );

      setAllBooks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } finally {
      setLoading(false);
    }
  }, [page, submittedKeyword, categoryIdsParam]);

  useEffect(() => {
    console.log("page changed:", page);
  }, [page]);
  useEffect(() => {
    console.log("PAGE UPDATED:", page);
  }, [page]);
  // Reset khi đổi category (skip lần mount đầu)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setKeyword("");
    setSubmittedKeyword("");
    changePage(1);
  }, [categoryIdsParam]);

  // Load data
  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = () => {
    setSubmittedKeyword(keyword);
    changePage(1);
  };

  const handleAddToCart = (book) => {
    if (!user) {
      onShowLogin?.();
      return;
    }
    setPickingBook(book);
  };

  const handleBranchConfirm = async (branchId) => {
    const book = pickingBook;
    setPickingBook(null);
    setAdding(book.id);
    try {
      await addToCart(book.id, 1, branchId);
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
                  padding: 0,
                  marginLeft: 2,
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

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
          <div className="spinner-border spinner-border-sm text-primary me-2" />{" "}
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
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow .2s, transform .2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,.10)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => setDetailBookId(b.id)}
            >
              {/* Cover image */}
              <div
                style={{
                  height: 180,
                  background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {b.images?.length > 0 ? (
                  <img
                    src={`${IMG_BASE}${b.images[0]}`}
                    alt={b.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: b.images?.length > 0 ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <i
                    className="bi bi-book"
                    style={{ fontSize: 48, color: "#93c5fd" }}
                  />
                </div>
                {b.images?.length > 1 && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(0,0,0,.5)",
                      color: "#fff",
                      fontSize: 10,
                      borderRadius: 20,
                      padding: "2px 7px",
                    }}
                  >
                    +{b.images.length - 1} ảnh
                  </span>
                )}
              </div>

              {/* Content */}
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                }}
              >
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
                {b.categoryName && (
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
                    {b.categoryName}
                  </span>
                )}

                <div style={{ marginTop: "auto" }}>
                  {b.discountPercent > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#dc2626",
                          }}
                        >
                          {Number(b.discountedPrice || 0).toLocaleString()} VND
                        </span>
                        <span
                          style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 4,
                            padding: "1px 5px",
                          }}
                        >
                          -{Math.round(b.discountPercent)}%
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
                            color: "#94a3b8",
                            textDecoration: "line-through",
                          }}
                        >
                          {Number(b.originalPrice || 0).toLocaleString()} VND
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          📅 {b.publishedYear}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#dc2626",
                        }}
                      >
                        {Number(b.price || 0).toLocaleString()} VND
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        📅 {b.publishedYear}
                      </span>
                    </div>
                  )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(b);
                  }}
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
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => changePage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => changePage(p)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ccc",
                background: p === page ? "#2563eb" : "#fff",
                color: p === page ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => changePage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {!loading && totalElements > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Hiển thị {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, totalElements)} / {totalElements} sách
        </div>
      )}

      <BranchPickerModal
        book={pickingBook}
        onConfirm={handleBranchConfirm}
        onClose={() => setPickingBook(null)}
      />
      <BookDetail
        bookId={detailBookId}
        onClose={() => setDetailBookId(null)}
        onAddToCart={handleAddToCart}
        user={user}
      />
    </section>
  );
}
