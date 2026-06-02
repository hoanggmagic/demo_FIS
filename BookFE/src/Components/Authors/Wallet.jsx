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
  const [incomeByBook, setIncomeByBook] = useState([]); // 👈 THÊM
  const [incomeDetail, setIncomeDetail] = useState([]); // 👈 THÊM
  const [tab, setTab] = useState("overview");

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
      const [balRes, txRes, wdRes, byBookRes, detailRes] = await Promise.all([
        axios.get(`${API}/balance`, getHeaders()),
        axios.get(`${API}/transactions`, getHeaders()),
        axios.get(`${API}/withdraw-history`, getHeaders()),
        axios.get(`${API}/income/by-book`, getHeaders()), // 👈 THÊM
        axios.get(`${API}/income/detail`, getHeaders()), // 👈 THÊM
      ]);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
      setWithdrawHistory(wdRes.data);
      setIncomeByBook(byBookRes.data); // 👈 THÊM
      setIncomeDetail(detailRes.data); // 👈 THÊM
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
    ({ PENDING: "#ff9800", APPROVED: "#22c55e", REJECTED: "#ef4444" })[s] ||
    "#999";

  const statusLabel = (s) =>
    ({ PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" })[s] ||
    s;

  const totalIncome = incomeByBook.reduce(
    (sum, b) => sum + Number(b.totalIncome || 0),
    0,
  );

  return (
    <div style={{ padding: 24, background: "#f4f7fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          borderRadius: 24,
          padding: 32,
          color: "#fff",
          marginBottom: 28,
          boxShadow: "0 10px 30px rgba(37,99,235,.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>Ví tác giả</p>
            <h1 style={{ margin: "10px 0 0", fontSize: 38, fontWeight: 800 }}>
              {Number(balance).toLocaleString()} ₫
            </h1>
            {/* Tổng doanh thu từ sách 👈 THÊM */}
            <p style={{ margin: "8px 0 0", opacity: 0.75, fontSize: 14 }}>
              📚 Tổng doanh thu từ sách: {totalIncome.toLocaleString()} ₫
            </p>
          </div>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              backdropFilter: "blur(10px)",
            }}
          >
            💰
          </div>
        </div>
      </div>

      {/* TABS */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          ["overview", "📊 Giao dịch"],
          ["bybook", "📚 Doanh thu theo sách"], // 👈 THÊM
          ["withdraw", "💸 Rút tiền"],
          ["history", "📋 Lịch sử rút"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              border: "none",
              padding: "12px 22px",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              transition: ".2s",
              background:
                tab === key
                  ? "linear-gradient(135deg,#2563eb,#4f46e5)"
                  : "#fff",
              color: tab === key ? "#fff" : "#333",
              boxShadow:
                tab === key
                  ? "0 6px 18px rgba(37,99,235,.25)"
                  : "0 2px 10px rgba(0,0,0,.05)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.05)",
          }}
        >
          <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
            📈 Lịch sử giao dịch
          </h3>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#777" }}>
              Chưa có giao dịch nào.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {transactions.map((t, index) => (
                <div
                  key={index}
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #edf2f7",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#1e293b",
                        fontSize: 16,
                      }}
                    >
                      {t.description}
                    </div>
                    {t.bookName ? (
                      <div
                        style={{
                          fontSize: 14,
                          color: "#4f46e5",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        📚 {t.bookName}{" "}
                        {t.quantity ? `(x${t.quantity} đơn)` : ""}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#94a3b8",
                          marginBottom: 6,
                          fontStyle: "italic",
                        }}
                      >
                        ℹ️ Giao dịch rút tiền từ ví
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString("vi-VN")
                        : "---"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: t.type === "INCOME" ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {Number(t.amount).toLocaleString()} ₫
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOANH THU THEO SÁCH 👈 THÊM TOÀN BỘ BLOCK NÀY */}
      {tab === "bybook" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Tổng hợp theo đầu sách */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,.05)",
            }}
          >
            <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
              📚 Doanh thu theo từng đầu sách
            </h3>
            {incomeByBook.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#777" }}>
                Chưa có doanh thu.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {incomeByBook.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: "#f8fafc",
                      border: "1px solid #edf2f7",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#1e293b",
                          marginBottom: 6,
                        }}
                      >
                        📖 {b.bookTitle || "Không rõ tên sách"}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        🛒 Tổng đơn:{" "}
                        <b style={{ color: "#4f46e5" }}>{b.totalOrders} đơn</b>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#22c55e",
                      }}
                    >
                      +{Number(b.totalIncome).toLocaleString()} ₫
                    </div>
                  </div>
                ))}

                {/* Tổng cộng */}
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: 18,
                    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}
                  >
                    💰 Tổng doanh thu
                  </span>
                  <span
                    style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}
                  >
                    {totalIncome.toLocaleString()} ₫
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chi tiết từng giao dịch INCOME */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,.05)",
            }}
          >
            <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
              🧾 Chi tiết từng giao dịch
            </h3>
            {incomeDetail.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#777" }}>
                Chưa có dữ liệu.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {incomeDetail.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: "#f8fafc",
                      border: "1px solid #edf2f7",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e293b",
                          marginBottom: 4,
                        }}
                      >
                        📖 {t.bookTitle || "Không rõ"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginBottom: 2,
                        }}
                      >
                        {t.description}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString("vi-VN")
                          : "---"}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#22c55e",
                      }}
                    >
                      +{Number(t.amount).toLocaleString()} ₫
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW - giữ nguyên */}
      {tab === "withdraw" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,.05)",
          }}
        >
          <h3 style={{ marginBottom: 22, fontSize: 22, fontWeight: 700 }}>
            💸 Yêu cầu rút tiền
          </h3>
          <form onSubmit={handleWithdraw} style={{ display: "grid", gap: 18 }}>
            <input
              type="number"
              placeholder="Số tiền muốn rút"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              min={1000}
              style={input}
            />
            <input
              type="text"
              placeholder="Tên ngân hàng"
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
                border: "none",
                padding: "14px",
                borderRadius: 16,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                boxShadow: "0 10px 25px rgba(37,99,235,.25)",
              }}
            >
              {loading ? "Đang gửi..." : "💸 Gửi yêu cầu"}
            </button>
          </form>
          {message && (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 14,
                fontWeight: 600,
                background: message.includes("✅") ? "#ecfdf5" : "#fef2f2",
                color: message.includes("✅") ? "#16a34a" : "#dc2626",
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* HISTORY - giữ nguyên */}
      {tab === "history" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.05)",
          }}
        >
          <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
            📋 Lịch sử rút tiền
          </h3>
          {withdrawHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#777" }}>
              Chưa có yêu cầu nào.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {withdrawHistory.map((w) => (
                <div
                  key={w.id}
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid #edf2f7",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      {Number(w.amount).toLocaleString()} ₫
                    </div>
                    <div
                      style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}
                    >
                      {w.bankName} • {w.accountNumber}
                    </div>
                    <div
                      style={{ marginTop: 4, fontSize: 13, color: "#94a3b8" }}
                    >
                      {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: statusColor(w.status),
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {statusLabel(w.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const input = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #dbe3ec",
  outline: "none",
  fontSize: 15,
  background: "#f8fafc",
};
