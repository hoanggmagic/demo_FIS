import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BANK_ID = "970422";
const ACCOUNT_NO = "0001057138272";
const ACCOUNT_NAME = "KHUONG DINH HOANG";
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

        if (res.data.status === "SUCCESS") {
          setStatus("SUCCESS");
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái đơn hàng:", err);
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

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`📋 Đã sao chép ${label}!`);
  };

  // 1. Giao diện LỖI KHÔNG TÌM THẤY ĐƠN HÀNG
  if (!orderId) {
    return (
      <div className="payment-container font-layout">
        <div className="payment-card status-card">
          <div className="status-icon error-icon">⚠️</div>
          <p className="status-text">
            Không tìm thấy thông tin đơn hàng hợp lệ.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // 2. Giao diện THANH TOÁN THÀNH CÔNG
  if (status === "SUCCESS") {
    return (
      <div className="payment-container font-layout">
        <div className="payment-card status-card">
          <div className="status-icon success-icon">✓</div>
          <h2 className="success-title">Thanh toán thành công!</h2>
          <p className="status-subtext">
            Cảm ơn bạn đã mua hàng tại hệ thống của chúng tôi.
          </p>
          <p className="order-id-display">
            Mã đơn hàng: <strong>#{orderId}</strong>
          </p>
          <button className="btn btn-success" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  // 3. Giao diện THANH TOÁN CHÍNH (Desktop 2 cột)
  return (
    <div className="payment-container font-layout">
      {/* Thẻ chứa CSS tinh chỉnh */}
      <style>{styles}</style>

      <div className="payment-wrapper">
        {/* Nút quay lại */}
        <div className="back-button-container">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Hủy giao dịch & Quay lại trang chủ
          </button>
        </div>

        {/* Khối chính chia 2 cột trên Desktop */}
        <div className="payment-main-card">
          {/* CỘT TRÁI: Quét mã QR */}
          <div className="payment-column left-column">
            <div className="gateway-badge">
              <span className="badge-dot"></span>
              CỔNG THANH TOÁN CHUYỂN KHOẢN
            </div>
            <h3 className="gateway-title">Qua ứng dụng Ngân hàng (MBBank)</h3>

            <div className="qr-box-wrapper">
              <img src={qrUrl} alt="QR MBBank" className="qr-image" />
            </div>
            <p className="qr-hint">
              Mở App ngân hàng bất kỳ để quét mã tự động nhập chính xác thông
              tin
            </p>
          </div>

          {/* CỘT PHẢI: Thông tin chi tiết & Trạng thái */}
          <div className="payment-column right-column">
            {/* Hiển thị số tiền */}
            <div className="amount-box">
              <span className="amount-label">Số tiền cần quét</span>
              <div className="amount-value">
                {Number(amount).toLocaleString()} VND
              </div>
            </div>

            {/* Khung Đếm Ngược / Hết hạn */}
            {timeLeft > 0 ? (
              <div
                className={`timer-box ${timeLeft < 60 ? "timer-danger" : "timer-warning"}`}
              >
                <span className="timer-text">
                  ⏱️ Đơn hàng sẽ hết hạn sau:{" "}
                  <strong style={{ fontSize: "15px" }}>
                    {minutes}:{seconds}
                  </strong>
                </span>
                <div className="checking-status">
                  <div className="spinner-mini"></div>
                  <span>Hệ thống đang kiểm tra giao dịch tự động...</span>
                </div>
              </div>
            ) : (
              <div className="timer-box timer-danger text-center">
                <p className="expired-text">
                  ⏰ Quá thời gian thanh toán (5 phút)!
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => navigate("/")}
                >
                  Tạo lại đơn hàng mới
                </button>
              </div>
            )}

            {/* Chuyển khoản thủ công */}
            <div className="manual-transfer-section">
              <h4 className="section-title">Hoặc chuyển khoản thủ công:</h4>

              <div className="info-list">
                <div className="info-row">
                  <span className="row-label">Ngân hàng:</span>
                  <span className="row-value bold">
                    MBBank (Ngân hàng Quân Đội)
                  </span>
                </div>

                <div className="info-row">
                  <span className="row-label">Chủ tài khoản:</span>
                  <span className="row-value bold">{ACCOUNT_NAME}</span>
                </div>

                <div className="info-row highlight-row">
                  <span className="row-label">Số tài khoản:</span>
                  <div className="row-action-group">
                    <span className="row-value bold monospace">
                      {ACCOUNT_NO}
                    </span>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopy(ACCOUNT_NO, "Số tài khoản")}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="info-row highlight-row">
                  <span className="row-label">Nội dung ghi:</span>
                  <div className="row-action-group">
                    <span className="row-value bold description-text">
                      {description}
                    </span>
                    <button
                      className="btn-copy"
                      onClick={() => handleCopy(description, "Nội dung")}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lưu ý chân trang */}
            <div className="important-note">
              ⚠️ <strong>Lưu ý quan trọng:</strong> Hãy giữ nguyên chính xác
              100%
              <strong> Nội dung chuyển khoản</strong> để hệ thống tự động duyệt
              đơn hàng (trong 10-30 giây).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toàn bộ CSS tạo giao diện Desktop Ngang chuẩn UI/UX hiện đại
const styles = `
  .font-layout {
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    color: #0f172a;
  }
  .payment-container {
    background: #f1f5f9;
    min-height: 100vh;
    padding: 40px 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  .payment-wrapper {
    max-width: 1000px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .back-button-container {
    align-self: flex-start;
  }
  .btn-back {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .btn-back:hover {
    color: #1e293b;
  }
  
  /* Bố cục chính Grid chia 2 cột trên Desktop */
  .payment-main-card {
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }
  
  .payment-column {
    padding: 40px;
  }
  .left-column {
    background: #fafafa;
    border-right: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .right-column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
  }

  /* Badge & Tiêu đề */
  .gateway-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #eff6ff;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #1e40af;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    background: #2563eb;
    border-radius: 50%;
  }
  .gateway-title {
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  /* Khung QR */
  .qr-box-wrapper {
    background: #ffffff;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    transition: transform 0.3s ease;
  }
  .qr-box-wrapper:hover {
    transform: scale(1.02);
  }
  .qr-image {
    width: 240px;
    height: 240px;
    display: block;
  }
  .qr-hint {
    font-size: 13px;
    color: #64748b;
    margin-top: 16px;
    margin-bottom: 0;
    max-width: 280px;
    line-height: 1.4;
  }

  /* Số tiền hiển thị */
  .amount-box {
    background: #f8fafc;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid #f1f5f9;
    text-align: center;
  }
  .amount-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .amount-value {
    font-size: 28px;
    font-weight: 800;
    color: #ef4444;
    margin-top: 4px;
  }

  /* Đếm ngược */
  .timer-box {
    border-radius: 16px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .timer-warning {
    background: #fff7ed;
    border: 1px solid #ffedd5;
  }
  .timer-danger {
    background: #fef2f2;
    border: 1px solid #fca5a5;
  }
  .timer-text {
    font-size: 13px;
    color: #ea580c;
    font-weight: 600;
    text-align: center;
  }
  .timer-danger .timer-text, .expired-text {
    color: #dc2626;
  }
  .checking-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }

  /* Danh sách thông tin */
  .manual-transfer-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .section-title {
    margin: 0;
    font-size: 14px;
    color: #334155;
    font-weight: 700;
  }
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }
  .highlight-row {
    background: #f8fafc;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px dashed #e2e8f0;
  }
  .row-label {
    color: #64748b;
  }
  .row-value {
    color: #1e293b;
  }
  .row-value.bold {
    font-weight: 600;
  }
  .row-value.monospace {
    font-family: Monaco, Consolas, "Courier New", monospace;
    font-size: 14px;
  }
  .description-text {
    color: #2563eb !important;
  }
  .row-action-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Nút bấm tiện ích */
  .btn-copy {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    color: #2563eb;
    transition: all 0.2s;
  }
  .btn-copy:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
  .important-note {
    padding: 12px 16px;
    background: #fdf2f8;
    border: 1px solid #fbcfe8;
    border-radius: 12px;
    font-size: 12px;
    color: #be185d;
    line-height: 1.5;
  }

  /* Giao diện trạng thái (Success / Error Card) */
  .status-card {
    max-width: 450px;
    width: 100%;
    padding: 40px;
    text-align: center;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }
  .status-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 36px;
    margin: 0 auto 20px;
  }
  .success-icon { background: #f0fdf4; color: #16a34a; }
  .error-icon { background: #fef2f2; color: #dc2626; }
  .success-title { color: #16a34a; margin-bottom: 12px; font-weight: 700; font-size: 24px;}
  .status-text { color: #64748b; font-size: 16px; margin-bottom: 24px; }
  .status-subtext { color: #64748b; font-size: 15px; margin-bottom: 8px; }
  .order-id-display { color: #1e293b; font-size: 14px; margin-bottom: 24px; }
  
  .btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-success { background: #16a34a; color: #fff; }
  .btn-success:hover { background: #15803d; }
  .btn-danger { background: #dc2626; color: #fff; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 8px; width: auto; margin: 4px auto 0; }

  /* Hoạt ảnh Spinner */
  .spinner-mini {
    width: 14px;
    height: 14px;
    border: 2px solid #cbd5e1;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive: Chuyển về 1 cột dọc trên thiết bị di động */
  @media (max-width: 768px) {
    .payment-main-card {
      grid-template-columns: 1fr;
    }
    .left-column {
      border-right: none;
      border-bottom: 1px dashed #e2e8f0;
      padding: 32px 20px;
    }
    .right-column {
      padding: 32px 20px;
    }
  }
`;
