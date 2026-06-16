import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  updateCartBranch,
} from "../../Api/USer/CartApi";
import { getBookStock } from "../../Api/USer/BookApi";

// ─── BranchSelector popup ────────────────────────────────────────────────────
function BranchSelector({ item, onClose, onSuccess }) {
  // branchList: [{ branchId, branchName, address, quantity, status }] từ stock API
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(item.branchId);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      try {
        // Stock API: [{ branchId, branchName, address, phone, status, quantity }]
        const res = await getBookStock(item.bookId);
        setBranchList(res.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [item.bookId]);

  const handleSave = async () => {
    if (selected === item.branchId) {
      onClose();
      return;
    }
    const branch = branchList.find((b) => b.branchId === selected);
    if (!branch || branch.quantity <= 0) {
      alert("❌ Chi nhánh này đã hết hàng!");
      return;
    }
    setSaving(true);
    try {
      await updateCartBranch(item.cartItemId, selected);
      onSuccess();
      onClose();
    } catch {
      alert("❌ Không thể đổi chi nhánh. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.35)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const box = {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 28px 24px",
    width: 420,
    maxWidth: "calc(100vw - 32px)",
    boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
  };

  return (
    <div style={overlay}>
      <div ref={ref} style={box}>
        <h4
          style={{
            margin: "0 0 4px",
            fontSize: 17,
            fontWeight: 800,
            color: "#1e293b",
          }}
        >
          Đổi chi nhánh
        </h4>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
          📖 <strong>{item.title}</strong>
        </p>

        {loading ? (
          <p
            style={{ textAlign: "center", color: "#94a3b8", padding: "16px 0" }}
          >
            ⏳ Đang tải danh sách chi nhánh…
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {branchList.map((b) => {
              const stock = b.quantity ?? 0;
              const isCurrent = b.branchId === item.branchId;
              const isSelected = b.branchId === selected;
              const inactive = b.status === "inactive";
              const noStock = stock <= 0;
              const disabled = inactive || noStock;

              return (
                <label
                  key={b.branchId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                    background: isSelected
                      ? "linear-gradient(135deg,#eff6ff,#dbeafe)"
                      : disabled
                        ? "#f8fafc"
                        : "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <input
                      type="radio"
                      name="branch"
                      value={b.branchId}
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => !disabled && setSelected(b.branchId)}
                      style={{ accentColor: "#2563eb", width: 16, height: 16 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1e293b",
                        }}
                      >
                        🏪 {b.branchName}
                        {isCurrent && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              padding: "1px 7px",
                              borderRadius: 20,
                              background: "#dcfce7",
                              color: "#16a34a",
                              fontWeight: 700,
                            }}
                          >
                            Hiện tại
                          </span>
                        )}
                      </div>
                      {b.address && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {b.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {inactive ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        Tạm đóng
                      </span>
                    ) : noStock ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "#fee2e2",
                          color: "#dc2626",
                        }}
                      >
                        Hết hàng
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#22c55e",
                          fontWeight: 700,
                        }}
                      >
                        Còn {stock}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 11,
              border: "1.5px solid #e2e8f0",
              background: "#f8fafc",
              color: "#64748b",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              flex: 2,
              padding: "11px 0",
              borderRadius: 11,
              border: "none",
              background: saving
                ? "#93c5fd"
                : "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
            }}
          >
            {saving ? "Đang lưu…" : "Xác nhận đổi chi nhánh"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Cart ────────────────────────────────────────────────────────────────
export default function Cart({ reload }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [branchSelectorItem, setBranchSelectorItem] = useState(null); // item đang mở popup
  const navigate = useNavigate();
  const location = useLocation();
  const goToLogin = () =>
    navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      const data = res.data || [];
      setItems(data);
      setSelected(
        new Set(
          data
            .filter((i) => i.bookStatus === "ACTIVE")
            .map((i) => i.cartItemId),
        ),
      );
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      if (err.response?.status === 401) {
        alert("🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        goToLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [reload]);

  const toggleSelect = (cartItemId) => {
    const item = items.find((i) => i.cartItemId === cartItemId);
    if (item && item.bookStatus !== "ACTIVE") return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cartItemId) ? next.delete(cartItemId) : next.add(cartItemId);
      return next;
    });
  };

  const toggleBranch = (branchItems) => {
    const ids = branchItems.map((i) => i.cartItemId);
    const allChecked = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectedItems = items.filter((i) => selected.has(i.cartItemId));
  const total = selectedItems.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("❌ Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }
    if (selectedItems.some((i) => i.bookStatus !== "ACTIVE")) {
      alert(
        "❌ Có sách đã ngừng phát hành trong đơn, vui lòng bỏ chọn trước khi thanh toán!",
      );
      return;
    }
    if (selectedItems.some((i) => i.branchStatus === "inactive")) {
      alert(
        "❌ Một số sản phẩm thuộc chi nhánh đang tạm đóng cửa. Vui lòng bỏ chọn các sản phẩm đó!",
      );
      return;
    }
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("❌ Vui lòng đăng nhập để thanh toán!");
        goToLogin();
        return;
      }
      const branchIds = [...new Set(selectedItems.map((i) => i.branchId))];
      if (branchIds.length > 1) {
        alert(
          "❌ Các sản phẩm đã chọn thuộc nhiều chi nhánh khác nhau.\nVui lòng chỉ chọn sản phẩm từ 1 chi nhánh mỗi lần.",
        );
        return;
      }
      const branchId = branchIds[0] || 1;
      const branchName =
        selectedItems.find((i) => i.branchId === branchId)?.branchName || "";
      navigate("/checkout", {
        state: { selectedItems, total, branchId, branchName },
      });
    } catch (err) {
      console.error("Lỗi khi chuẩn bị thanh toán:", err);
      alert("❌ Không thể chuyển sang bước thanh toán. Vui lòng thử lại.");
    }
  };

  const handleQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    const item = items.find((i) => i.cartItemId === cartItemId);
    if (item && newQty > item.stock) {
      alert(`❌ Chỉ còn ${item.stock} sản phẩm trong kho!`);
      return;
    }
    try {
      await updateCartItem(cartItemId, newQty);
      load();
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
    }
  };

  const handleRemove = async (cartItemId) => {
    if (!window.confirm("Xóa sách này khỏi giỏ?")) return;
    try {
      await removeCartItem(cartItemId);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
    try {
      await clearCart();
      setItems([]);
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontSize: "16px",
          color: "#64748b",
        }}
      >
        ⏳ Đang tải giỏ hàng của bạn...
      </div>
    );
  }

  const byBranch = items.reduce((acc, item) => {
    const key = item.branchId || 0;
    if (!acc[key])
      acc[key] = {
        branchName: item.branchName || "Chưa rõ chi nhánh",
        branchStatus: item.branchStatus || "active",
        items: [],
      };
    acc[key].items.push(item);
    return acc;
  }, {});

  const pageBg = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.08), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
    padding: "28px 16px 40px",
    fontFamily: "Segoe UI, sans-serif",
  };

  const card = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
    backdropFilter: "blur(8px)",
  };

  const primaryButton = {
    width: "100%",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    padding: "14px 16px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(37,99,235,0.24)",
  };

  return (
    <div style={pageBg}>
      {/* Branch selector popup */}
      {branchSelectorItem && (
        <BranchSelector
          item={branchSelectorItem}
          onClose={() => setBranchSelectorItem(null)}
          onSuccess={load}
        />
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header card */}
        <div
          style={{
            ...card,
            padding: "24px 24px 20px",
            marginBottom: 20,
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.96), rgba(29,78,216,0.92))",
            color: "#fff",
            border: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  marginBottom: 12,
                }}
              >
                🛒 Giỏ hàng của bạn
              </div>
              <h3 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                Sẵn sàng chốt đơn
              </h3>
              <p
                style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.84)" }}
              >
                Kiểm tra số lượng, chọn chi nhánh và chuyển sang bước nhập địa
                chỉ trước khi thanh toán.
              </p>
            </div>
            <div
              style={{
                minWidth: 180,
                padding: "14px 16px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>Số sản phẩm</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                {items.length}
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "64px 24px" }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                margin: "0 auto 18px",
                display: "grid",
                placeItems: "center",
                fontSize: 34,
                color: "#2563eb",
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              }}
            >
              🛒
            </div>
            <h4 style={{ margin: "0 0 8px", fontSize: 22, color: "#0f172a" }}>
              Giỏ hàng đang trống
            </h4>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 20px" }}>
              Thêm vài cuốn sách yêu thích vào giỏ rồi quay lại thanh toán nhé.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                ...primaryButton,
                width: "auto",
                minWidth: 180,
                border: "none",
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 360px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* LEFT: product list */}
            <div>
              {Object.entries(byBranch).map(([branchId, group]) => {
                const allChecked = group.items.every((i) =>
                  selected.has(i.cartItemId),
                );
                return (
                  <div
                    key={branchId}
                    style={{ ...card, padding: 20, marginBottom: 20 }}
                  >
                    {/* Branch header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        paddingBottom: 14,
                        borderBottom: "1px solid #f1f5f9",
                        marginBottom: 16,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={() => toggleBranch(group.items)}
                        style={{
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                          accentColor: "#2563eb",
                        }}
                      />
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1e3a8a",
                          background:
                            "linear-gradient(135deg, #eff6ff, #dbeafe)",
                          padding: "6px 12px",
                          borderRadius: 999,
                        }}
                      >
                        🏪 {group.branchName}
                        {group.branchStatus === "inactive" && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#fef3c7",
                              color: "#d97706",
                            }}
                          >
                            Tạm đóng cửa
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Items */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {group.items.map((item) => {
                        const currentQty = item.quantity ?? 1;
                        const isInactive = item.bookStatus !== "ACTIVE";
                        const isChecked = selected.has(item.cartItemId);
                        return (
                          <div
                            key={item.cartItemId}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "auto 1fr auto",
                              gap: 16,
                              alignItems: "center",
                              padding: "12px 0",
                              borderBottom: "1px solid #f8fafc",
                              transition: "all 0.2s",
                              opacity: isInactive ? 0.5 : isChecked ? 1 : 0.6,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isInactive}
                              onChange={() => toggleSelect(item.cartItemId)}
                              style={{
                                width: 18,
                                height: 18,
                                cursor: isInactive ? "not-allowed" : "pointer",
                                accentColor: "#2563eb",
                              }}
                            />

                            <div>
                              <h5
                                style={{
                                  margin: "0 0 6px 0",
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                {item.title}
                                {isInactive && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 20,
                                      background: "#fee2e2",
                                      color: "#dc2626",
                                    }}
                                  >
                                    Đã ngừng bán
                                  </span>
                                )}
                              </h5>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                {item.discountPercent > 0 ? (
                                  <>
                                    <span
                                      style={{
                                        color: "#ef4444",
                                        fontWeight: 700,
                                        fontSize: 14,
                                      }}
                                    >
                                      {Number(item.price || 0).toLocaleString()}{" "}
                                      VND
                                    </span>
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        color: "#94a3b8",
                                        fontSize: 12,
                                      }}
                                    >
                                      {Number(
                                        item.originalPrice || 0,
                                      ).toLocaleString()}{" "}
                                      VND
                                    </span>
                                    <span
                                      style={{
                                        background: "#fef2f2",
                                        color: "#dc2626",
                                        borderRadius: 4,
                                        padding: "1px 6px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      -{Math.round(item.discountPercent)}%
                                    </span>
                                  </>
                                ) : (
                                  <span
                                    style={{
                                      color: "#ef4444",
                                      fontWeight: 700,
                                      fontSize: 14,
                                    }}
                                  >
                                    {Number(item.price || 0).toLocaleString()}{" "}
                                    VND
                                  </span>
                                )}
                              </div>

                              {/* ── NÚT ĐỔI CHI NHÁNH ── */}
                              <button
                                onClick={() => setBranchSelectorItem(item)}
                                style={{
                                  marginTop: 8,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "none",
                                  border: "1.5px dashed #93c5fd",
                                  borderRadius: 8,
                                  padding: "4px 10px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#2563eb",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#eff6ff";
                                  e.currentTarget.style.borderColor = "#2563eb";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "none";
                                  e.currentTarget.style.borderColor = "#93c5fd";
                                }}
                              >
                                🏪 Đổi chi nhánh
                              </button>
                            </div>

                            {/* Qty + subtotal + remove */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 24,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: 8,
                                  overflow: "hidden",
                                  background: "#fff",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleQty(item.cartItemId, currentQty - 1)
                                  }
                                  disabled={currentQty <= 1}
                                  style={{
                                    border: "none",
                                    background: "#f8fafc",
                                    width: 32,
                                    height: 32,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#64748b",
                                  }}
                                >
                                  −
                                </button>
                                <span
                                  style={{
                                    width: 40,
                                    textAlign: "center",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#334155",
                                  }}
                                >
                                  {currentQty}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQty(item.cartItemId, currentQty + 1)
                                  }
                                  disabled={currentQty >= item.stock}
                                  style={{
                                    border: "none",
                                    background: "#f8fafc",
                                    width: 32,
                                    height: 32,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#64748b",
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              <div
                                style={{ textAlign: "right", minWidth: 110 }}
                              >
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    marginBottom: 2,
                                  }}
                                >
                                  Thành tiền
                                </div>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#334155",
                                  }}
                                >
                                  {Number(item.subtotal || 0).toLocaleString()}{" "}
                                  đ
                                </span>
                              </div>

                              <button
                                onClick={() => handleRemove(item.cartItemId)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  fontSize: 13,
                                  padding: 4,
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.color = "#ef4444")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.color = "#94a3b8")
                                }
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={handleClear}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 4px",
                  }}
                >
                  🗑️ Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            {/* RIGHT: summary */}
            <div style={{ position: "sticky", top: 20, ...card, padding: 24 }}>
              <h4
                style={{
                  margin: "0 0 16px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1e293b",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: 12,
                }}
              >
                Tóm tắt đơn hàng
              </h4>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  fontSize: 14,
                  color: "#64748b",
                }}
              >
                <span>Sản phẩm đã chọn:</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {selectedItems.length} mục
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 24,
                  paddingTop: 12,
                  borderTop: "1px dashed #e2e8f0",
                }}
              >
                <span
                  style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}
                >
                  Tổng tiền thanh toán:
                </span>
                <span
                  style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}
                >
                  {Number(total).toLocaleString()} VND
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                style={primaryButton}
                onMouseEnter={(e) => (e.target.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.target.style.opacity = 1)}
              >
                Mua hàng ({selectedItems.length})
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 11,
                  marginTop: 12,
                  marginBox: 0,
                }}
              >
                💡 Lưu ý: Hệ thống chỉ hỗ trợ thanh toán sản phẩm của cùng 1 chi
                nhánh trong một đơn hàng.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
