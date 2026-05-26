import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/author/wallet";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [tab, setTab] = useState("overview"); // overview | withdraw | history
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [balRes, txRes, wdRes] = await Promise.all([
        axios.get(`${API}/balance`, getHeaders()),
        axios.get(`${API}/transactions`, getHeaders()),
        axios.get(`${API}/withdraw-history`, getHeaders()),
      ]);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
      setWithdrawHistory(wdRes.data);
    } catch (err) {
      console.error("Load wallet error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${API}/withdraw`,
        {
          amount: Number(form.amount),
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountHolder: form.accountHolder,
        },
        getHeaders(),
      );
      setMessage("✅ " + res.data.message);
      setForm({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountHolder: "",
      });
      loadData();
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Lỗi gửi yêu cầu"));
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) =>
    ({ PENDING: "#ff9800", APPROVED: "#4caf50", REJECTED: "#e53935" })[s] ||
    "#999";
  const statusLabel = (s) =>
    ({ PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" })[s] ||
    s;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h2>💰 Ví tác giả</h2>

      {/* Số dư */}
      <div
        style={{
          padding: 24,
          background: "#1976d2",
          borderRadius: 16,
          color: "#fff",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, opacity: 0.8 }}>Số dư hiện tại</p>
        <h1 style={{ margin: "8px 0", fontSize: 36 }}>
          {Number(balance).toLocaleString()} VND
        </h1>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          ["overview", "📊 Giao dịch"],
          ["withdraw", "💸 Rút tiền"],
          ["history", "📋 Lịch sử rút"],
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

      {/* Tab: Giao dịch */}
      {tab === "overview" && (
        <div>
          <h3>Lịch sử giao dịch</h3>
          {transactions.length === 0 ? (
            <p>Chưa có giao dịch nào.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Mô tả</th>
                  <th style={th}>Số tiền</th>
                  <th style={th}>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={td}>{t.description}</td>
                    <td style={{ ...td, color: "#4caf50", fontWeight: "bold" }}>
                      +{Number(t.amount).toLocaleString()} VND
                    </td>
                    <td style={td}>
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Rút tiền */}
      {tab === "withdraw" && (
        <div>
          <h3>Yêu cầu rút tiền</h3>
          <form
            onSubmit={handleWithdraw}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              type="number"
              placeholder="Số tiền muốn rút (VND)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              min={1000}
              style={input}
            />
            <input
              type="text"
              placeholder="Tên ngân hàng (VD: MBBank, Vietcombank...)"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              required
              style={input}
            />
            <input
              type="text"
              placeholder="Số tài khoản"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              required
              style={input}
            />
            <input
              type="text"
              placeholder="Tên chủ tài khoản"
              value={form.accountHolder}
              onChange={(e) =>
                setForm({ ...form, accountHolder: e.target.value })
              }
              required
              style={input}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {loading ? "Đang gửi..." : "💸 Gửi yêu cầu rút tiền"}
            </button>
          </form>
          {message && (
            <p
              style={{
                marginTop: 12,
                color: message.includes("✅") ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {/* Tab: Lịch sử rút */}
      {tab === "history" && (
        <div>
          <h3>Lịch sử rút tiền</h3>
          {withdrawHistory.length === 0 ? (
            <p>Chưa có yêu cầu nào.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Số tiền</th>
                  <th style={th}>Ngân hàng</th>
                  <th style={th}>STK</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.map((w) => (
                  <tr key={w.id}>
                    <td style={{ ...td, fontWeight: "bold" }}>
                      {Number(w.amount).toLocaleString()} VND
                    </td>
                    <td style={td}>{w.bankName}</td>
                    <td style={td}>{w.accountNumber}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: statusColor(w.status),
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        {statusLabel(w.status)}
                      </span>
                    </td>
                    <td style={td}>
                      {new Date(w.createdAt).toLocaleDateString("vi-VN")}
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
const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
};
