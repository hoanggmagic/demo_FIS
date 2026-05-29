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
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading để UX mượt hơn
  const navigate = useNavigate();

  // 1. Sửa hàm load: Bọc try/catch để bắt lỗi 401
  const load = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setItems(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      if (err.response && err.response.status === 401) {
        alert("🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login"); // Chuyển hướng nếu bị 401
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

      const orderPayload = {
        userId: user.id,
        branchId: 1,
        items: items.map((i) => ({
          bookId: Number(i.bookId || i.id || i.book?.id),
          qty: Number(i.quantity || i.qty || 1),
        })),
      };

      const orderRes = await createOrder(orderPayload);
      console.log("ORDER RESULT:", orderRes.data);
      const orderId = orderRes.data.orderId;

      navigate("/payment", {
        state: {
          orderId,
          amount: total,
        },
      });
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      console.error("Response data:", err.response?.data);
      alert("❌ Đặt hàng thất bại. Vui lòng thử lại!");
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
      load(); // Load lại để cập nhật subtotal và total chuẩn từ Backend
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
      console.error("Lỗi khi xóa sản phẩm:", err);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
    try {
      await clearCart();
      setItems([]);
    } catch (err) {
      console.error("Lỗi khi xóa giỏ hàng:", err);
    }
  };

  // Tính tổng tiền dựa trên trường subtotal của từng item
  const total = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

  if (loading && items.length === 0) {
    return (
      <div className="cart-container">
        <p>⏳ Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h3>🛒 Giỏ hàng</h3>

      {items.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
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
              {items.map((item) => {
                // Đồng bộ hóa trường số lượng (đề phòng API trả về lúc quantity lúc qty)
                const currentQty = item.quantity ?? item.qty ?? 1;

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
                    <td>{Number(item.subtotal || 0).toLocaleString()} VND</td>
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
