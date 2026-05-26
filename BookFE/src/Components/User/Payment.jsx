import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { clearCart } from "../../Api/User/CartApi";

const BANK_ID = "970422";
const ACCOUNT_NO = "0001057138272";
const ACCOUNT_NAME = "BOOK STORE KDH";
const API_BASE = "http://localhost:8080/api";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId;
  const amount = location.state?.amount;

  const [status, setStatus] = useState("PENDING");
  const [timeLeft, setTimeLeft] = useState(300);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  console.log("Token:", localStorage.getItem("token")); // thêm dòng này vào đầu useEffect
  const description = `Thanh toan don hang ${orderId}`;

  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  useEffect(() => {
    if (!orderId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/orders/status/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Polling response:", res.data); // debug tạm

        if (res.data.status === "SUCCESS") {
          setStatus("SUCCESS");
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          try {
            await clearCart();
          } catch (e) {
            console.error("clearCart failed", e);
          }
        } // ← đóng if
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollingRef.current);
      clearInterval(timerRef.current);
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div style={{ padding: 20 }}>
        <p>Không có thông tin đơn hàng.</p>
        <button onClick={() => navigate("/")}>← Quay lại</button>
      </div>
    );
  }

  if (status === "SUCCESS") {
    // ← đổi PAID → SUCCESS
    return (
      <div
        style={{
          padding: 40,
          maxWidth: 480,
          margin: "60px auto",
          textAlign: "center",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "#2e7d32", marginBottom: 8 }}>
          Thanh toán thành công!
        </h2>
        <p style={{ color: "#666", marginBottom: 8 }}>
          Cảm ơn bạn đã mua hàng.
        </p>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Mã đơn hàng: <strong>{orderId}</strong>
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 32px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: 16 }}>
        ← Quay lại
      </button>

      <h2>💳 Thanh toán MBBank</h2>

      <div
        style={{
          background: "#f5f5f5",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <p>
          Order ID: <strong>{orderId}</strong>
        </p>
        <p>
          Số tiền:{" "}
          <strong style={{ color: "#e53935", fontSize: 18 }}>
            {Number(amount).toLocaleString()} VND
          </strong>
        </p>
        <p>
          Ngân hàng: <strong>MBBank</strong>
        </p>
        <p>
          STK: <strong>{ACCOUNT_NO}</strong>
        </p>
        <p>
          Chủ TK: <strong>{ACCOUNT_NAME}</strong>
        </p>
        <p>
          Nội dung: <strong style={{ color: "#1976d2" }}>{description}</strong>
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ color: "#666", marginBottom: 8 }}>
          Quét mã QR để thanh toán:
        </p>
        <img
          src={qrUrl}
          alt="QR MBBank"
          style={{
            width: 280,
            height: 280,
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        />
      </div>

      {timeLeft > 0 ? (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ color: "#666", fontSize: 13 }}>
            ⏱ Tự động xác nhận sau khi chuyển khoản •{" "}
            <span
              style={{
                color: timeLeft < 60 ? "#e53935" : "#333",
                fontWeight: "bold",
              }}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </p>
          <p style={{ color: "#888", fontSize: 12 }}>
            Đang chờ xác nhận từ ngân hàng...
          </p>
        </div>
      ) : (
        <div
          style={{ textAlign: "center", color: "#e53935", marginBottom: 16 }}
        >
          <p>⏰ Hết thời gian thanh toán.</p>
          <button onClick={() => navigate("/")}>Quay lại</button>
        </div>
      )}

      <p style={{ color: "#888", fontSize: 12, textAlign: "center" }}>
        ⚠️ Giữ nguyên nội dung chuyển khoản để đơn hàng được xác nhận tự động.
      </p>
    </div>
  );
}
