import { useEffect, useState } from "react";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../Api/User/CartApi";
import "../../Style/User/Cart.css";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../Api/User/OrderApi";

export default function Cart({ reload }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setItems(res.data || []);
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

  const handleCheckout = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("❌ Vui lòng đăng nhập để thanh toán!");
        navigate("/login");
        return;
      }
      const user = JSON.parse(userStr);

      // Kiểm tra tất cả items có cùng chi nhánh không
      const branchIds = [...new Set(items.map((i) => i.branchId))];
      if (branchIds.length > 1) {
        alert(
          "❌ Giỏ hàng có sách từ nhiều chi nhánh khác nhau.\nVui lòng chỉ đặt hàng từ 1 chi nhánh mỗi lần.",
        );
        return;
      }

      const branchId = branchIds[0] || 1;

      const orderPayload = {
        userId: user.id,
        branchId,
        items: items.map((i) => ({
          bookId: Number(i.bookId),
          qty: Number(i.quantity || 1),
        })),
      };

      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes.data.orderId;

      navigate("/payment", { state: { orderId, amount: total } });
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
    } catch (err) {
      console.error(err);
    }
  };

  const total = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

  if (loading && items.length === 0) {
    return (
      <div className="cart-container">
        <p>⏳ Đang tải giỏ hàng...</p>
      </div>
    );
  }

  // Nhóm items theo chi nhánh để hiển thị rõ ràng
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
          {/* Hiển thị theo nhóm chi nhánh */}
          {Object.entries(byBranch).map(([branchId, group]) => (
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
                    return (
                      <tr key={item.cartItemId}>
                        <td>{item.title}</td>
                        <td>{Number(item.price || 0).toLocaleString()} VND</td>
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
          ))}

          <div className="cart-footer">
            <button className="btn-clear" onClick={handleClear}>
              🗑️ Xóa tất cả
            </button>
            <span className="cart-total">
              Tổng: {Number(total).toLocaleString()} VND
            </span>
            <button type="button" onClick={handleCheckout}>
              💳 Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
}
