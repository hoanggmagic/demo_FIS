import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../Api/User/CartApi";
import { createOrder } from "../../Api/User/OrderApi";

export default function Cart({ reload }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      const data = res.data || [];
      setItems(data);
      setSelected(new Set(data.map((i) => i.cartItemId)));
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      if (err.response?.status === 401) {
        alert("🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [reload]);

  const toggleSelect = (cartItemId) => {
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
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("❌ Vui lòng đăng nhập để thanh toán!");
        navigate("/login");
        return;
      }
      const user = JSON.parse(userStr);

      const branchIds = [...new Set(selectedItems.map((i) => i.branchId))];
      if (branchIds.length > 1) {
        alert(
          "❌ Các sản phẩm đã chọn thuộc nhiều chi nhánh khác nhau.\nVui lòng chỉ chọn sản phẩm từ 1 chi nhánh mỗi lần.",
        );
        return;
      }

      const branchId = branchIds[0] || 1;

      const orderPayload = {
        userId: user.id,
        branchId,
        items: selectedItems.map((i) => ({
          bookId: Number(i.bookId),
          qty: Number(i.quantity || 1),
        })),
      };

      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes.data.orderId;

      navigate("/payment", {
        state: {
          orderId,
          amount: total,
          selectedCartItemIds: selectedItems.map((i) => i.cartItemId),
        },
      });
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      const data = err.response?.data;
      if (data?.alternatives?.length > 0) {
        const list = data.alternatives
          .map((a) => `• ${a.branchName} (còn ${a.quantity} cuốn)`)
          .join("\n");
        alert(`❌ ${data.error}\n\nChi nhánh còn hàng:\n${list}`);
      } else {
        alert("❌ " + (data?.error || data || "Đặt hàng thất bại"));
      }
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

  // Nhóm theo chi nhánh
  const byBranch = items.reduce((acc, item) => {
    const key = item.branchId || 0;
    if (!acc[key])
      acc[key] = {
        branchName: item.branchName || "Chưa rõ chi nhánh",
        items: [],
      };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "20px 15px",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f8fafc",
      }}
    >
      <h3
        style={{
          fontWeight: 700,
          marginBottom: 24,
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🛒 Giỏ hàng{" "}
        <span style={{ fontSize: 14, fontWeight: 400, color: "#64748b" }}>
          ({items.length} sản phẩm)
        </span>
      </h3>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 16 }}>
            Giỏ hàng của bạn đang trống.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        // Bố cục Layout 2 cột chính
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* CỘT TRÁI: DANH SÁCH CHI NHÁNH VÀ SẢN PHẨM */}
          <div>
            {Object.entries(byBranch).map(([branchId, group]) => {
              const allChecked = group.items.every((i) =>
                selected.has(i.cartItemId),
              );
              return (
                <div
                  key={branchId}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow:
                      "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.006)",
                    border: "1px solid #e2e8f0",
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  {/* Header Chi nhánh */}
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
                        background: "#eff6ff",
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      🏪 {group.branchName}
                    </span>
                  </div>

                  {/* Danh sách các cuốn sách trong chi nhánh này */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {group.items.map((item) => {
                      const currentQty = item.quantity ?? 1;
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
                            opacity: isChecked ? 1 : 0.6,
                          }}
                        >
                          {/* Checkbox chọn sản phẩm */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(item.cartItemId)}
                            style={{
                              width: 18,
                              height: 18,
                              cursor: "pointer",
                              accentColor: "#2563eb",
                            }}
                          />

                          {/* Thông tin tên sách + Giá bán */}
                          {/* ✅ Thay toàn bộ div đó bằng: */}
                          <div>
                            <h5
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: 15,
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              {item.title}
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
                                  {Number(item.price || 0).toLocaleString()} VND
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bộ điều khiển số lượng, thành tiền và nút xóa */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 24,
                            }}
                          >
                            {/* Bộ tăng giảm số lượng */}
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

                            {/* Thành tiền riêng của dòng */}
                            <div style={{ textAlign: "right", minWidth: 110 }}>
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
                                {Number(item.subtotal || 0).toLocaleString()} đ
                              </span>
                            </div>

                            {/* Nút xóa item */}
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

            {/* Nút dọn dẹp giỏ ở dưới cùng cột trái */}
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

          {/* CỘT PHẢI: THÔNG TIN THANH TOÁN (STIKY SUMMARY BINDING) */}
          <div
            style={{
              position: "sticky",
              top: 20,
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              padding: 24,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
            }}
          >
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
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                Tổng tiền thanh toán:
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>
                {Number(total).toLocaleString()} VND
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                transition: "opacity 0.2s",
              }}
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
  );
}
