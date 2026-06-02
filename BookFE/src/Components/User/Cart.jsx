import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../Api/User/CartApi";
import "../../Style/User/Cart.css";
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

  const total = selectedItems.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

  if (loading && items.length === 0) {
    return (
      <div className="cart-container">
        <p>⏳ Đang tải giỏ hàng...</p>
      </div>
    );
  }

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
    <div className="cart-container">
      <h3>🛒 Giỏ hàng</h3>

      {items.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          {Object.entries(byBranch).map(([branchId, group]) => {
            const allChecked = group.items.every((i) =>
              selected.has(i.cartItemId),
            );
            return (
              <div key={branchId} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    padding: "6px 12px",
                    background: "#eff6ff",
                    borderRadius: 8,
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={() => toggleBranch(group.items)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <i className="bi bi-shop" style={{ color: "#2563eb" }} />
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#2563eb" }}
                  >
                    {group.branchName}
                  </span>
                </div>

                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>✓</th>
                      <th>Sách</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => {
                      const currentQty = item.quantity ?? 1;
                      const isChecked = selected.has(item.cartItemId);
                      return (
                        <tr
                          key={item.cartItemId}
                          style={{ opacity: isChecked ? 1 : 0.45 }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(item.cartItemId)}
                              style={{
                                width: 16,
                                height: 16,
                                cursor: "pointer",
                              }}
                            />
                          </td>
                          <td>{item.title}</td>
                          <td>
                            {Number(item.price || 0).toLocaleString()} VND
                          </td>
                          <td>
                            <div className="qty-control">
                              <button
                                onClick={() =>
                                  handleQty(item.cartItemId, currentQty - 1)
                                }
                                disabled={currentQty <= 1}
                              >
                                −
                              </button>
                              <span>{currentQty}</span>
                              <button
                                onClick={() =>
                                  handleQty(item.cartItemId, currentQty + 1)
                                }
                                disabled={currentQty >= item.stock}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            {Number(item.subtotal || 0).toLocaleString()} VND
                          </td>
                          <td>
                            <button
                              className="btn-remove"
                              onClick={() => handleRemove(item.cartItemId)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="cart-footer">
            <button className="btn-clear" onClick={handleClear}>
              🗑️ Xóa tất cả
            </button>
            <span className="cart-total">
              Tổng ({selectedItems.length} sản phẩm):{" "}
              {Number(total).toLocaleString()} VND
            </span>
            <button type="button" onClick={handleCheckout}>
              💳 Thanh toán ({selectedItems.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
