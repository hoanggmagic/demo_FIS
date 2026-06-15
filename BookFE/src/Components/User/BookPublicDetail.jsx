import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../Api/User/CartApi";
import BookDetail from "./BookDetail";
import BranchPickerModal from "./BranchPickerModal";
import { getBookById } from "../../Api/User/BookApi";
import { slugify } from "../../utils/slugify";

export default function BookPublicDetail({ user, onShowLogin }) {
  const { bookSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickingBook, setPickingBook] = useState(null);
  const [adding, setAdding] = useState(null);
  const bookId = Number(String(bookSlug ?? "").split("-").pop());

  useEffect(() => {
    if (!Number.isFinite(bookId) || bookId <= 0) {
      setBook(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getBookById(bookId)
      .then((res) => setBook(res.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    if (!book) return;
    const description = (book.description || "Khám phá cuốn sách này trên Digital Books.")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const title = `${book.title} | Digital Books`;
    const canonicalSlug = `${slugify(book.title)}-${book.id}`;
    const canonicalPath = `/books/${canonicalSlug}`;
    const absoluteCanonical = `${window.location.origin}${canonicalPath}`;
    const imageUrl = book.images?.length
      ? `${window.location.origin}/uploads/books/${book.images[0]}`
      : `${window.location.origin}/favicon.svg`;
    document.title = title;

    const update = (selector, attrName, value) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        document.head.appendChild(el);
      }
      if (selector.includes("name=")) {
        el.setAttribute("name", attrName);
      } else {
        el.setAttribute("property", attrName);
      }
      el.setAttribute("content", value);
    };

    update('meta[name="description"]', "description", description);
    update('meta[property="og:title"]', "og:title", title);
    update('meta[property="og:description"]', "og:description", description);
    update('meta[property="og:image"]', "og:image", imageUrl);
    update('meta[property="og:url"]', "og:url", absoluteCanonical);
    update('meta[name="twitter:title"]', "twitter:title", title);
    update('meta[name="twitter:description"]', "twitter:description", description);
    update('meta[name="twitter:image"]', "twitter:image", imageUrl);

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", absoluteCanonical);
    }

    let jsonLd = document.head.querySelector('script#book-jsonld');
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.id = "book-jsonld";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      description,
      image: [imageUrl],
      author: {
        "@type": "Person",
        name: book.authorName || "Digital Books",
      },
      isbn: String(book.id),
      inLanguage: "vi",
      url: absoluteCanonical,
      offers: {
        "@type": "Offer",
        price: Number(book.discountedPrice || book.price || 0),
        priceCurrency: "VND",
        availability:
          Number(book.quantity || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    });

    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [book, location.pathname, navigate]);

  const handleAddToCart = (selectedBook) => {
    if (!user) {
      onShowLogin?.();
      return;
    }
    setPickingBook(selectedBook);
  };

  const handleBranchConfirm = async (branchId) => {
    const selectedBook = pickingBook;
    setPickingBook(null);
    setAdding(selectedBook?.id || null);
    try {
      await addToCart(selectedBook.id, 1, branchId);
    } catch (err) {
      console.error("addToCart failed", err);
      alert("Không thể thêm vào giỏ hàng!");
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary" />
        <p className="mt-3 mb-0">Đang tải chi tiết sách...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-5 text-center text-muted">
        Không tìm thấy sách.
      </div>
    );
  }

  return (
    <div className="container py-4">
      <BookDetail
        bookId={book.id}
        bookData={book}
        onAddToCart={handleAddToCart}
        variant="page"
        onBack={() => navigate("/")}
      />

      <BranchPickerModal
        book={pickingBook}
        onConfirm={handleBranchConfirm}
        onClose={() => setPickingBook(null)}
      />

      {adding && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,.35)",
            zIndex: 2500,
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{ position: "absolute", top: "50%", left: "50%" }}
          />
        </div>
      )}
    </div>
  );
}
