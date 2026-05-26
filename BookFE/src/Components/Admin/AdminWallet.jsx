import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/wallet";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const statusColor = (s) =>
  ({ PENDING: "#ff9800", APPROVED: "#4caf50", REJECTED: "#e53935" })[s] ||
  "#999";
const statusLabel = (s) =>
  ({ PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" })[s] || s;

export default function AdminWallet() {
  const [balance, setBalance] = useState(0);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("requests");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [balRes, reqRes] = await Promise.all([
        axios.get(`${API}/balance`, getHeaders()),
        axios.get(`${API}/withdraw-requests`, getHeaders()),
      ]);
      setBalance(balRes.data.balance);
      setRequests(reqRes.data);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action, requestData) => {
    if (action === "approve") {
      const confirm = window.confirm(
        `Xác nhận duyệt yêu cầu rút tiền?\n\n` +
          `Tác giả: ${requestData.fullName}\n` +
          `Số tiền: ${Number(requestData.amount).toLocaleString()} VND\n` +
          `Ngân hàng: ${requestData.bankName}\n` +
          `STK: ${requestData.accountNumber}\n` +
          `Chủ TK: ${requestData.accountHolder}`,
      );
      if (!confirm) return;
    } else {
      if (
        !window.confirm(`Xác nhận từ chối yêu cầu của ${requestData.fullName}?`)
      )
        return;
    }
    try {
      const res = await axios.put(
        `${API}/withdraw-requests/${id}/${action}`,
        {},
        getHeaders(),
      );
      setMessage("✅ " + res.data.message);
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Lỗi xử lý"));
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const done = requests.filter((r) => r.status !== "PENDING");

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>💰 Quản lý ví</h2>

      {/* Số dư admin */}
      <div
        style={{
          padding: 24,
          background: "#1976d2",
          borderRadius: 16,
          color: "#fff",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: 0, opacity: 0.8 }}>Số dư ví Admin</p>
          <h1 style={{ margin: "4px 0", fontSize: 32 }}>
            {Number(balance).toLocaleString()} VND
          </h1>
        </div>
        <div style={{ fontSize: 48 }}>🏦</div>
      </div>

      {message && (
        <p
          style={{
            color: message.includes("✅") ? "green" : "red",
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          {message}
        </p>
      )}

      {/* Tab */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          ["requests", `⏳ Chờ duyệt (${pending.length})`],
          ["done", "✅ Đã xử lý"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: tab === key ? "#1976d2" : "#eee",
              color: tab === key ? "#fff" : "#333",
              fontWeight: "bold",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Chờ duyệt */}
      {tab === "requests" && (
        <div>
          {pending.length === 0 ? (
            <p>Không có yêu cầu nào đang chờ.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Tác giả</th>
                  <th style={th}>Số tiền</th>
                  <th style={th}>Ngân hàng</th>
                  <th style={th}>STK</th>
                  <th style={th}>Chủ TK</th>
                  <th style={th}>Ngày</th>
                  <th style={th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>
                      <strong>{r.fullName}</strong>
                      <br />
                      <small>{r.username}</small>
                    </td>
                    <td style={{ ...td, fontWeight: "bold", color: "#e53935" }}>
                      {Number(r.amount).toLocaleString()} VND
                    </td>
                    <td style={td}>{r.bankName}</td>
                    <td style={td}>{r.accountNumber}</td>
                    <td style={td}>{r.accountHolder}</td>
                    <td style={td}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleAction(r.id, "approve", r)}
                          style={{
                            padding: "6px 12px",
                            background: "#4caf50",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            r,
                          }}
                        >
                          ✅ Duyệt
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "reject", r)}
                          style={{
                            padding: "6px 12px",
                            background: "#e53935",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            r,
                          }}
                        >
                          ❌ Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Đã xử lý */}
      {tab === "done" && (
        <div>
          {done.length === 0 ? (
            <p>Chưa có yêu cầu nào được xử lý.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Tác giả</th>
                  <th style={th}>Số tiền</th>
                  <th style={th}>Ngân hàng</th>
                  <th style={th}>STK</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {done.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>
                      <strong>{r.fullName}</strong>
                      <br />
                      <small>{r.username}</small>
                    </td>
                    <td style={{ ...td, fontWeight: "bold" }}>
                      {Number(r.amount).toLocaleString()} VND
                    </td>
                    <td style={td}>{r.bankName}</td>
                    <td style={td}>{r.accountNumber}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: statusColor(r.status),
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td style={td}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const th = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
};
const td = { padding: "10px 12px", borderBottom: "1px solid #eee" };
