import { useEffect, useState } from "react";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../Api/User/CartApi";
import "../../Style/User/Cart.css";

export default function Cart({ reload }) {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await getCart();
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, [reload]);

  const handleQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    await updateCartItem(cartItemId, newQty);
    load();
  };

  const handleRemove = async (cartItemId) => {
    if (!window.confirm("Xóa sách này khỏi giỏ?")) return;
    await removeCartItem(cartItemId);
    load();
  };

  const handleClear = async () => {
    if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
    await clearCart();
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

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
              {items.map((item) => (
                <tr key={item.cartItemId}>
                  <td>{item.title}</td>
                  <td>{Number(item.price).toLocaleString()} VND</td>
                  <td>
                    <div className="qty-control">
                      <button
                        onClick={() =>
                          handleQty(item.cartItemId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQty(item.cartItemId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{Number(item.subtotal).toLocaleString()} VND</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(item.cartItemId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-footer">
            <button className="btn-clear" onClick={handleClear}>
              🗑️ Xóa tất cả
            </button>
            <span className="cart-total">
              Tổng: {Number(total).toLocaleString()} VND
            </span>
            <button
              className="btn-checkout"
              onClick={() => alert("Chức năng thanh toán sắp có!")}
            >
              💳 Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
}
