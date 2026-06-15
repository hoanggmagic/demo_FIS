import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../../Api/User/OrderApi";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedItems = [],
    total = 0,
    branchId = 1,
    branchName = "",
  } = location.state || {};

  const [deliveryType, setDeliveryType] = useState("DELIVERY");
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    deliveryAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!selectedItems.length) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
        <p>Không có sản phẩm nào để thanh toán.</p>
        <button
          onClick={() => navigate("/cart")}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  const validate = () => {
    if (deliveryType !== "DELIVERY") return true;
    const e = {};
    if (!form.receiverName.trim())
      e.receiverName = "Vui lòng nhập tên người nhận";
    if (!form.receiverPhone.trim())
      e.receiverPhone = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(form.receiverPhone.trim()))
      e.receiverPhone = "Số điện thoại không hợp lệ";
    if (!form.deliveryAddress.trim())
      e.deliveryAddress = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      const payload = {
        userId: user.id,
        branchId,
        deliveryType,
        receiverName:
          deliveryType === "DELIVERY" ? form.receiverName.trim() : null,
        receiverPhone:
          deliveryType === "DELIVERY" ? form.receiverPhone.trim() : null,
        deliveryAddress:
          deliveryType === "DELIVERY" ? form.deliveryAddress.trim() : null,
        items: selectedItems.map((i) => ({
          bookId: Number(i.bookId),
          qty: Number(i.quantity || 1),
        })),
      };

      const res = await createOrder(payload);
      const orderId = res.data.orderId;

      navigate("/payment", {
        state: {
          orderId,
          amount: total,
          selectedCartItemIds: selectedItems.map((i) => i.cartItemId),
        },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.alternatives?.length > 0) {
        const list = data.alternatives
          .map((a) => `• ${a.branchName} (còn ${a.quantity} cuốn)`)
          .join("\n");
        alert(`❌ ${data.error}\n\nChi nhánh còn hàng:\n${list}`);
      } else {
        alert("❌ " + (data?.error || data || "Đặt hàng thất bại"));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `1.5px solid ${hasError ? "#ef4444" : "#dbe3f0"}`,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#f8fafc",
    transition: "border-color .15s, box-shadow .15s, background .15s",
  });

  const pageBg = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,0.10), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
    padding: "28px 16px 40px",
    fontFamily: "Segoe UI, sans-serif",
  };

  const card = {
    background: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    border: "1px solid rgba(226,232,240,0.92)",
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
    backdropFilter: "blur(8px)",
  };

  return (
    <div
      style={{
        ...pageBg,
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            ...card,
            marginBottom: 20,
            padding: "22px 24px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.95))",
          }}
        >
          <button
            onClick={() => navigate("/cart")}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            ← Quay lại giỏ hàng
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
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
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  marginBottom: 10,
                }}
              >
                ✍️ Bước thanh toán
              </div>
              <h2
                style={{
                  margin: 0,
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: 30,
                  letterSpacing: "-0.02em",
                }}
              >
                Xác nhận thông tin giao hàng
              </h2>
              <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14 }}>
                Kiểm tra đơn, chọn hình thức nhận hàng và điền địa chỉ trước khi sang bước thanh toán.
              </p>
            </div>

            <div
              style={{
                minWidth: 220,
                padding: "14px 16px",
                borderRadius: 18,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b" }}>Chi nhánh</div>
              <div style={{ fontWeight: 800, color: "#1e3a8a", marginTop: 4 }}>
                {branchName || "Chưa chọn chi nhánh"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Mã chi nhánh: #{branchId}
              </div>
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div
          style={{
            ...card,
            padding: 20,
            marginBottom: 20,
          }}
        >
        <h4
          style={{
            margin: "0 0 14px",
            fontWeight: 800,
            color: "#0f172a",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📦 Sản phẩm ({selectedItems.length})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {selectedItems.map((item) => (
            <div
              key={item.cartItemId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: "#334155",
                padding: "10px 12px",
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #eef2f7",
              }}
            >
              <span>
                {item.title}{" "}
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>x{item.quantity}</span>
              </span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>
                {Number(item.subtotal || 0).toLocaleString()} VND
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px dashed #e2e8f0",
            marginTop: 14,
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(135deg, rgba(239,246,255,0.8), rgba(248,250,252,0.92))",
            borderRadius: 16,
            paddingLeft: 14,
            paddingRight: 14,
          }}
        >
          <span style={{ fontWeight: 800, color: "#1e293b" }}>Tổng cộng</span>
          <span style={{ fontWeight: 900, fontSize: 20, color: "#dc2626" }}>
            {Number(total).toLocaleString()} VND
          </span>
        </div>
      </div>

      {/* Chọn hình thức nhận hàng */}
      <div
        style={{
          ...card,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h4
          style={{
            margin: "0 0 16px",
            fontWeight: 800,
            color: "#0f172a",
            fontSize: 15,
          }}
        >
          🚚 Hình thức nhận hàng
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Option 1: Nhận tại cửa hàng */}
          <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: 16,
                borderRadius: 16,
                border: `2px solid ${deliveryType === "STORE" ? "#2563eb" : "#dbe3f0"}`,
                background:
                  deliveryType === "STORE"
                    ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
                    : "#f8fafc",
                cursor: "pointer",
                transition: "all .15s",
                boxShadow:
                  deliveryType === "STORE"
                    ? "0 12px 24px rgba(37,99,235,0.08)"
                    : "none",
              }}
            >
            <input
              type="radio"
              name="deliveryType"
              value="STORE"
              checked={deliveryType === "STORE"}
              onChange={() => {
                setDeliveryType("STORE");
                setErrors({});
              }}
              style={{ marginTop: 2, accentColor: "#2563eb" }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                🏪 Nhận tại cửa hàng
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                Chi nhánh: <strong style={{ color: "#0f172a" }}>{branchName}</strong>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#16a34a",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                Miễn phí • Có thể nhận ngay
              </div>
            </div>
          </label>

          {/* Option 2: Giao hàng tận nơi */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: 16,
              borderRadius: 16,
              border: `2px solid ${deliveryType === "DELIVERY" ? "#2563eb" : "#dbe3f0"}`,
              background:
                deliveryType === "DELIVERY"
                  ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
                  : "#f8fafc",
              cursor: "pointer",
              transition: "all .15s",
              boxShadow:
                deliveryType === "DELIVERY"
                  ? "0 12px 24px rgba(37,99,235,0.08)"
                  : "none",
            }}
          >
            <input
              type="radio"
              name="deliveryType"
              value="DELIVERY"
              checked={deliveryType === "DELIVERY"}
              onChange={() => setDeliveryType("DELIVERY")}
              style={{ marginTop: 2, accentColor: "#2563eb" }}
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                🚚 Giao hàng tận nơi
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                Phí giao hàng tính khi giao
              </div>

              {/* Form địa chỉ — chỉ hiện khi chọn DELIVERY */}
              {deliveryType === "DELIVERY" && (
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  onClick={(e) => e.preventDefault()}
                  >
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Tên người nhận <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.receiverName}
                      onChange={(e) => {
                        setForm({ ...form, receiverName: e.target.value });
                        setErrors({ ...errors, receiverName: "" });
                      }}
                      style={inputStyle(errors.receiverName)}
                    />
                    {errors.receiverName && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: "#ef4444",
                        }}
                      >
                        {errors.receiverName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0xxxxxxxxx"
                      value={form.receiverPhone}
                      onChange={(e) => {
                        setForm({ ...form, receiverPhone: e.target.value });
                        setErrors({ ...errors, receiverPhone: "" });
                      }}
                      style={inputStyle(errors.receiverPhone)}
                    />
                    {errors.receiverPhone && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: "#ef4444",
                        }}
                      >
                        {errors.receiverPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Địa chỉ giao hàng{" "}
                      <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={form.deliveryAddress}
                      onChange={(e) => {
                        setForm({ ...form, deliveryAddress: e.target.value });
                        setErrors({ ...errors, deliveryAddress: "" });
                      }}
                      rows={3}
                      style={{
                        ...inputStyle(errors.deliveryAddress),
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                    {errors.deliveryAddress && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: "#ef4444",
                        }}
                      >
                        {errors.deliveryAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Nút đặt hàng */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          background: loading
            ? "#93c5fd"
            : "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "#fff",
          border: "none",
          padding: "16px 18px",
          borderRadius: 16,
          fontSize: 16,
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 16px 30px rgba(37,99,235,0.24)",
          transition: "transform .2s, opacity .2s, box-shadow .2s",
          transform: loading ? "none" : "translateY(0)",
        }}
      >
        {loading ? "Đang xử lý..." : "Tiếp tục thanh toán →"}
      </button>
      </div>
    </div>
  );
}
