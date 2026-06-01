import { useEffect, useState } from "react";
import {
  getSummary,
  getByDay,
  getByMonth,
  getByBranch,
  getByBook,
} from "../../Api/Admin/RevenueApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
];

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function RevenueDashboard() {
  const [tab, setTab] = useState("day"); // day | month | branch | book
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState({});
  const [byDay, setByDay] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byBranch, setByBranch] = useState([]);
  const [byBook, setByBook] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, dayRes, monthRes, branchRes, bookRes] = await Promise.all([
        getSummary(from, to),
        getByDay(from, to),
        getByMonth(year),
        getByBranch(from, to),
        getByBook(from, to),
      ]);
      setSummary(sumRes.data || {});
      setByDay(dayRes.data || []);
      setByMonth(
        (monthRes.data || []).map((r) => ({
          ...r,
          label: `T${r.month}/${r.year}`,
        })),
      );
      setByBranch(branchRes.data || []);
      setByBook(bookRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [from, to, year]);

  const StatCard = ({ icon, label, value, color, sub }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        border: "1px solid #e2e8f0",
        flex: 1,
        minWidth: 180,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: color + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className={icon} style={{ color, fontSize: 18 }} />
        </div>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );

  const TabBtn = ({ id, label, icon }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        background: tab === id ? "#6366f1" : "transparent",
        color: tab === id ? "#fff" : "#64748b",
        transition: "all 0.15s",
      }}
    >
      <i className={icon} /> {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Từ
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 150 }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Đến
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 150 }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Năm
          </label>
          <select
            className="form-select form-select-sm"
            style={{ width: 100 }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-1"
          onClick={load}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise" />
          {loading ? "Đang tải..." : "Cập nhật"}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard
          icon="bi bi-receipt"
          label="Tổng đơn hàng"
          value={summary.totalOrders ?? 0}
          color="#6366f1"
          sub="Đơn thành công"
        />
        <StatCard
          icon="bi bi-cash-stack"
          label="Tổng doanh thu"
          value={fmt(summary.totalRevenue)}
          color="#10b981"
          sub="Sau thanh toán"
        />
        <StatCard
          icon="bi bi-person-badge"
          label="Thu nhập tác giả"
          value={fmt(summary.totalAuthor)}
          color="#f59e0b"
          sub="68% doanh thu"
        />
        <StatCard
          icon="bi bi-building"
          label="Thu nhập nền tảng"
          value={fmt(summary.totalPlatform)}
          color="#8b5cf6"
          sub="32% doanh thu"
        />
      </div>

      {/* Tab buttons */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "12px 16px",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <TabBtn id="day" label="Theo ngày" icon="bi bi-calendar-day" />
        <TabBtn id="month" label="Theo tháng" icon="bi bi-calendar-month" />
        <TabBtn id="branch" label="Theo chi nhánh" icon="bi bi-shop" />
        <TabBtn id="book" label="Top sách" icon="bi bi-book" />
      </div>

      {/* Charts */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* By Day */}
        {tab === "day" && (
          <>
            <h6 style={{ fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              <i className="bi bi-calendar-day me-2 text-primary" />
              Doanh thu theo ngày
            </h6>
            {byDay.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox fs-3 d-block mb-2" />
                Không có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [fmt(v), "Doanh thu"]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {/* By Month */}
        {tab === "month" && (
          <>
            <h6 style={{ fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              <i className="bi bi-calendar-month me-2 text-primary" />
              Doanh thu theo tháng — {year}
            </h6>
            {byMonth.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox fs-3 d-block mb-2" />
                Không có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [fmt(v), "Doanh thu"]} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {/* By Branch */}
        {tab === "branch" && (
          <>
            <h6 style={{ fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              <i className="bi bi-shop me-2 text-primary" />
              Doanh thu theo chi nhánh
            </h6>
            {byBranch.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox fs-3 d-block mb-2" />
                Không có dữ liệu
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={byBranch}
                      dataKey="revenue"
                      nameKey="branchName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ branchName, percent }) =>
                        `${branchName} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {byBranch.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Branch table */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Chi nhánh</th>
                        <th className="text-center">Đơn</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byBranch.map((b, i) => (
                        <tr key={b.branchId}>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: COLORS[i % COLORS.length],
                                marginRight: 8,
                              }}
                            />
                            {b.branchName}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">
                              {b.orders}
                            </span>
                          </td>
                          <td
                            className="text-end"
                            style={{ fontWeight: 600, color: "#6366f1" }}
                          >
                            {fmt(b.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* By Book */}
        {tab === "book" && (
          <>
            <h6 style={{ fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              <i className="bi bi-book me-2 text-primary" />
              Top 10 sách bán chạy nhất
            </h6>
            {byBook.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox fs-3 d-block mb-2" />
                Không có dữ liệu
              </div>
            ) : (
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <ResponsiveContainer width="55%" height={320}>
                  <BarChart data={byBook} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="bookTitle"
                      width={120}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v.length > 16 ? v.slice(0, 16) + "…" : v
                      }
                    />
                    <Tooltip formatter={(v) => [fmt(v), "Doanh thu"]} />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      fill="#8b5cf6"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Book table */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Sách</th>
                        <th className="text-center">Đã bán</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byBook.map((b, i) => (
                        <tr key={b.bookId}>
                          <td>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: i < 3 ? "#fef3c7" : "#f1f5f9",
                                color: i < 3 ? "#d97706" : "#64748b",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td style={{ fontSize: 13 }}>{b.bookTitle}</td>
                          <td className="text-center">
                            <span className="badge bg-success">
                              {b.totalSold}
                            </span>
                          </td>
                          <td
                            className="text-end"
                            style={{ fontWeight: 600, color: "#6366f1" }}
                          >
                            {fmt(b.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
