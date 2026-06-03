import { useEffect, useState } from "react";
import { getBookById } from "../../Api/User/BookApi";

const IMG_BASE = "http://localhost:8080/uploads/books/";

export default function BookDetail({ bookId, onClose, onAddToCart, user }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setActiveImg(0);
    getBookById(bookId)
      .then((res) => {
        console.log("BOOK DETAIL RES:", res); // xem response
        console.log("BOOK DETAIL DATA:", res.data); // xem data
        setBook(res.data);
      })
      .catch((err) => {
        console.error("BOOK DETAIL ERROR:", err); // xem lỗi
        setBook(null);
      })
      .finally(() => setLoading(false));
  }, [bookId]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!bookId) return null;
  const quantity = Number(book?.quantity || 0);

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        paddingTop: 120,
        justifyContent: "center",
        animation: "fadeIn .18s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        .thumb-img:hover { border-color: #2563eb !important; opacity: 1 !important; }
      `}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 860,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.22)",
          animation: "slideUp .22s ease",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 16,
            float: "right",
            marginRight: 16,
            zIndex: 10,
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 18,
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#94a3b8" }}>
            <div className="spinner-border text-primary" />
            <p style={{ marginTop: 12 }}>Đang tải...</p>
          </div>
        ) : !book ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            Không tìm thấy sách.
          </div>
        ) : (
          <div style={{ padding: "32px 36px 36px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "300px 1fr",
                gap: 36,
              }}
            >
              {/* LEFT — Images */}
              <div>
                {/* Main image */}
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(135deg,#dbeafe,#eff6ff)",
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {book.images?.length > 0 ? (
                    <img
                      src={`${IMG_BASE}${book.images[activeImg]}`}
                      alt={book.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i
                      className="bi bi-book"
                      style={{ fontSize: 64, color: "#93c5fd" }}
                    />
                  )}
                </div>

                {/* Thumbnails */}
                {book.images?.length > 1 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {book.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`${IMG_BASE}${img}`}
                        alt=""
                        className="thumb-img"
                        onClick={() => setActiveImg(idx)}
                        style={{
                          width: 58,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 8,
                          border:
                            idx === activeImg
                              ? "2px solid #2563eb"
                              : "2px solid #e2e8f0",
                          cursor: "pointer",
                          opacity: idx === activeImg ? 1 : 0.65,
                          transition: "all .15s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Info */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Category badge */}
                {book.categoryName && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 11,
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontWeight: 600,
                    }}
                  >
                    {book.categoryName}
                  </span>
                )}

                {/* Title */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.35,
                  }}
                >
                  {book.title}
                </h2>

                {/* Author */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#475569",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ✍️ <strong>{book.authorName || "—"}</strong>
                  </span>
                  <span
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "4px 10px",
                    }}
                  >
                    📅 {book.publishedYear}
                  </span>
                </div>

                {/* Price */}
                <div style={{ margin: "4px 0" }}>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#dc2626",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {Number(book.price || 0).toLocaleString()} VND
                  </span>
                </div>

                {/* Stock */}
                <div
                  style={{
                    fontSize: 13,
                    color: quantity === 0 ? "#ef4444" : "#16a34a",
                  }}
                >
                  📦 {quantity === 0 ? "Hết hàng" : `Còn ${quantity}`}
                </div>
                {/* Divider */}
                <div
                  style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }}
                />

                {/* Description */}
                <div
                  style={{
                    height: 180, // chiều cao cố định
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      flexShrink: 0,
                    }}
                  >
                    Mô tả sách
                  </h4>

                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      paddingRight: 6,
                      borderRadius: 8,
                      background: "#f8fafc",
                      padding: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#475569",
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {book.description || "Chưa có mô tả cho sách này."}
                    </p>
                  </div>
                </div>

                {/* Add to cart button */}
                <button
                  disabled={book.quantity === 0}
                  onClick={() => {
                    onAddToCart(book);
                    onClose();
                  }}
                  style={{
                    marginTop: "auto",
                    background:
                      book.quantity === 0
                        ? "#f1f5f9"
                        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: book.quantity === 0 ? "#94a3b8" : "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: book.quantity === 0 ? "not-allowed" : "pointer",
                    boxShadow:
                      book.quantity === 0
                        ? "none"
                        : "0 4px 14px rgba(37,99,235,.3)",
                    transition: "opacity .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (book.quantity > 0) e.target.style.opacity = "0.88";
                  }}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  {book.quantity === 0 ? "Hết hàng" : "🛒 Thêm vào giỏ hàng"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
