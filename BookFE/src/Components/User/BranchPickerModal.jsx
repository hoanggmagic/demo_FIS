import { useEffect, useState } from "react";
import { getBookStock } from "../../Api/User/BranchApi";

// Modal chọn chi nhánh khi thêm vào giỏ
// Props:
//   book       — sách đang chọn { id, title }
//   onConfirm  — callback(branchId, branchName) khi khách chọn xong
//   onClose    — callback khi đóng modal
export default function BranchPickerModal({ book, onConfirm, onClose }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // branchId đang chọn

  useEffect(() => {
    if (!book) return;
    setLoading(true);
    getBookStock(book.id)
      .then((res) => setStock(res.data || []))
      .catch(() => setStock([]))
      .finally(() => setLoading(false));
  }, [book]);

  if (!book) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          zIndex: 3000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 3001,
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: "min(460px, 92vw)",
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <h5 style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>
              Chọn chi nhánh lấy hàng
            </h5>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              📚 {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#94a3b8",
            }}
          >
            ×
          </button>
        </div>

        {/* Danh sách chi nhánh */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
            <div className="spinner-border spinner-border-sm text-primary me-2" />
            Đang tải...
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {stock.map((s) => (
              <div
                key={s.branchId}
                onClick={() => s.quantity > 0 && setSelected(s.branchId)}
                style={{
                  border:
                    selected === s.branchId
                      ? "2px solid #2563eb"
                      : "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 16px",
                  cursor: s.quantity > 0 ? "pointer" : "not-allowed",
                  background:
                    selected === s.branchId
                      ? "#eff6ff"
                      : s.quantity === 0
                        ? "#f8fafc"
                        : "#fff",
                  opacity: s.quantity === 0 ? 0.6 : 1,
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      {selected === s.branchId && (
                        <i className="bi bi-check-circle-fill text-primary me-1" />
                      )}
                      {s.branchName}
                    </div>
                    {s.address && (
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                      >
                        <i className="bi bi-geo-alt me-1" />
                        {s.address}
                      </div>
                    )}
                    {s.phone && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        <i className="bi bi-telephone me-1" />
                        {s.phone}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: s.quantity === 0 ? "#fee2e2" : "#dcfce7",
                      color: s.quantity === 0 ? "#ef4444" : "#16a34a",
                    }}
                  >
                    {s.quantity === 0 ? "Hết hàng" : `Còn ${s.quantity}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Hủy
          </button>
          <button
            disabled={!selected}
            onClick={() => {
              const branch = stock.find((s) => s.branchId === selected);
              onConfirm(selected, branch?.branchName);
            }}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: selected
                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                : "#e2e8f0",
              color: selected ? "#fff" : "#94a3b8",
              cursor: selected ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <i className="bi bi-cart-plus me-1" />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </>
  );
}
