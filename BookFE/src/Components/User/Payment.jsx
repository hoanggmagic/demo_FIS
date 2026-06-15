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
            ← Về trang chủ
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
          <div className="status-pill success-pill">Đã xác nhận giao dịch</div>
          <h2 className="success-title">Thanh toán thành công!</h2>
          <p className="status-subtext">
            Cảm ơn bạn đã mua hàng. Hệ thống sẽ ghi nhận đơn của bạn ngay khi
            giao dịch được xác nhận.
          </p>
          <p className="order-id-display">
            Mã đơn hàng: <strong>#{orderId}</strong>
          </p>
          <div className="success-meta">
            <span>Trạng thái: <strong>Đang chờ duyệt tự động</strong></span>
            <span>Thời gian xác nhận: <strong>10-30 giây</strong></span>
          </div>
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
            ← Quay lại trang chủ
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
    background:
      radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 30%),
      radial-gradient(circle at top right, rgba(14,165,233,0.08), transparent 26%),
      linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
    min-height: 100vh;
    padding: 32px 20px;
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
    gap: 18px;
  }
  .back-button-container {
    align-self: flex-start;
  }
  .btn-back {
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(226,232,240,0.9);
    color: #475569;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    padding: 10px 14px;
    border-radius: 999px;
    box-shadow: 0 8px 18px rgba(15,23,42,0.05);
    transition: transform 0.2s, background 0.2s, color 0.2s;
  }
  .btn-back:hover {
    color: #1e293b;
    transform: translateY(-1px);
    background: #fff;
  }
  
  /* Bố cục chính Grid chia 2 cột trên Desktop */
  .payment-main-card {
    background: rgba(255,255,255,0.94);
    border-radius: 28px;
    box-shadow: 0 22px 60px rgba(15,23,42,0.10);
    border: 1px solid rgba(226,232,240,0.92);
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
    backdrop-filter: blur(8px);
  }
  
  .payment-column {
    padding: 38px;
  }
  .left-column {
    background:
      linear-gradient(180deg, rgba(248,250,252,0.95), rgba(239,246,255,0.9));
    border-right: 1px solid #eef2f7;
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
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    padding: 7px 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
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
    letter-spacing: -0.01em;
  }

  /* Khung QR */
  .qr-box-wrapper {
    background: #ffffff;
    padding: 18px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 16px 28px rgba(15,23,42,0.06);
    transition: transform 0.3s ease;
  }
  .qr-box-wrapper:hover {
    transform: scale(1.02);
  }
  .qr-image {
    width: 250px;
    height: 250px;
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
    background: linear-gradient(135deg, #f8fafc, #eff6ff);
    border-radius: 18px;
    padding: 16px;
    border: 1px solid #e2e8f0;
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
    color: #dc2626;
    margin-top: 4px;
  }

  /* Đếm ngược */
  .timer-box {
    border-radius: 18px;
    padding: 14px 16px;
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
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px dashed #dbe3f0;
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
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
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
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 14px;
    font-size: 12px;
    color: #9a3412;
    line-height: 1.5;
  }

  /* Giao diện trạng thái (Success / Error Card) */
  .status-card {
    max-width: 450px;
    width: 100%;
    padding: 40px 36px;
    text-align: center;
    background: rgba(255,255,255,0.96);
    border-radius: 28px;
    box-shadow: 0 20px 45px rgba(15,23,42,0.10);
    border: 1px solid rgba(226,232,240,0.92);
    backdrop-filter: blur(8px);
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
  .status-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.3px;
    margin-bottom: 10px;
  }
  .success-pill {
    background: #dcfce7;
    color: #166534;
  }
  .success-title { color: #16a34a; margin-bottom: 12px; font-weight: 800; font-size: 24px; letter-spacing: -0.01em;}
  .status-text { color: #64748b; font-size: 16px; margin-bottom: 24px; }
  .status-subtext { color: #64748b; font-size: 15px; margin-bottom: 8px; line-height: 1.55; }
  .order-id-display { color: #1e293b; font-size: 14px; margin-bottom: 16px; }
  .success-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
    font-size: 13px;
  }
  
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
  .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 10px 24px rgba(37,99,235,0.20); }
  .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
  .btn-success { background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; box-shadow: 0 10px 24px rgba(22,163,74,0.20); }
  .btn-success:hover { background: linear-gradient(135deg, #15803d, #166534); }
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
    .payment-container {
      padding: 18px 14px 28px;
      align-items: flex-start;
    }
    .payment-main-card {
      grid-template-columns: 1fr;
      border-radius: 22px;
    }
    .left-column {
      border-right: none;
      border-bottom: 1px dashed #e2e8f0;
      padding: 32px 20px;
    }
    .right-column {
      padding: 32px 20px;
    }
    .qr-image {
      width: 220px;
      height: 220px;
    }
  }
`;
