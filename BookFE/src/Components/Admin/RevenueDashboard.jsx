import { useEffect, useState, useCallback } from "react";
import {
  getSummary,
  getByDay,
  getByMonth,
  getByBranch,
  getByBook,
  getPlatformBalance,
} from "../../Api/Admin/RevenueApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const STAT_CARDS = [
  {
    key: "totalOrders",
    label: "Tổng đơn hàng",
    sub: "Đơn thành công",
    icon: "bi bi-receipt",
    bg: "#E6F1FB",
    color: "#185FA5",
    format: (v) => v ?? 0,
  },
  {
    key: "totalRevenue",
    label: "Tổng doanh thu",
    sub: "Sau thanh toán",
    icon: "bi bi-cash-stack",
    bg: "#EAF3DE",
    color: "#3B6D11",
    format: fmt,
  },
  {
    key: "totalAuthor",
    label: "Thu nhập tác giả",
    sub: "68% doanh thu",
    icon: "bi bi-person-badge",
    bg: "#FAEEDA",
    color: "#854F0B",
    format: fmt,
  },
  {
    key: "totalPlatform",
    label: "Thu nhập nền tảng",
    sub: "32% doanh thu",
    icon: "bi bi-building",
    bg: "#EEEDFE",
    color: "#534AB7",
    format: fmt,
  },
];

const BRANCH_COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D4537E", "#7F77DD"];

const QUICK_FILTERS = [
  { label: "Hôm nay", days: 0 },
  { label: "7 ngày", days: 7 },
  { label: "Tháng này", days: 30 },
];

const TABS = [
  { id: "day", label: "Theo ngày", icon: "bi bi-calendar-day" },
  { id: "month", label: "Theo tháng", icon: "bi bi-calendar-month" },
  { id: "branch", label: "Theo chi nhánh", icon: "bi bi-shop" },
  { id: "book", label: "Top sách", icon: "bi bi-book" },
];

const RANK_COLORS = [
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
];

const tooltipStyle = {
  borderRadius: 10,
  border: "none",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  fontSize: 13,
};

export default function RevenueDashboard() {
  const [tab, setTab] = useState("day");
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
  const [platformBalance, setPlatformBalance] = useState({
    totalEarned: 0,
    balance: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, dayRes, monthRes, branchRes, bookRes, balanceRes] =
        await Promise.all([
          getSummary(from, to),
          getByDay(from, to),
          getByMonth(year),
          getByBranch(from, to),
          getByBook(from, to),
          getPlatformBalance(),
        ]);
      setSummary(sumRes.data || {});
      setByDay(dayRes.data || []);
      setByMonth(
        (monthRes.data || []).map((r) => ({ ...r, label: `T${r.month}` })),
      );
      setByBranch(branchRes.data || []);
      setByBook(bookRes.data || []);
      setPlatformBalance(balanceRes.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [from, to, year]);

  useEffect(() => {
    load();
  }, [load]);

  const applyQuickFilter = (days) => {
    const t = new Date(),
      f = new Date();
    if (days > 0) f.setDate(f.getDate() - days);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  };

  const maxDayRev = Math.max(...byDay.map((b) => b.revenue || 0), 1);
  const maxMonthRev = Math.max(...byMonth.map((b) => b.revenue || 0), 1);
  const maxBranchRev = Math.max(...byBranch.map((b) => b.revenue || 0), 1);
  const maxBookRev = Math.max(...byBook.map((b) => b.revenue || 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter bar */}
      <div style={s.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={s.fg}>
            <span style={s.fl}>Từ</span>
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 140, fontSize: 13 }}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div style={s.fg}>
            <span style={s.fl}>Đến</span>
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 140, fontSize: 13 }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div style={s.fg}>
            <span style={s.fl}>Năm</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 88, fontSize: 13 }}
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
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={load}
            disabled={loading}
            style={s.primaryBtn}
          >
            <i className="bi bi-arrow-clockwise" />
            {loading ? "Đang tải..." : "Cập nhật"}
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {QUICK_FILTERS.map((q) => (
              <button
                key={q.label}
                onClick={() => applyQuickFilter(q.days)}
                style={s.quickBtn}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
        }}
      >
        {STAT_CARDS.map((card) => (
          <div key={card.key} style={s.statCard}>
            <div>
              <p style={s.statLabel}>{card.label}</p>
              <p style={s.statValue}>{card.format(summary[card.key])}</p>
              <p style={s.statSub}>{card.sub}</p>
            </div>
            <div style={{ ...s.iconBox, background: card.bg }}>
              <i
                className={card.icon}
                style={{ color: card.color, fontSize: 18 }}
              />
            </div>
          </div>
        ))}
        <div
          style={{ ...s.statCard, position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #185FA5, #378ADD)",
              borderRadius: "12px 12px 0 0",
            }}
          />
          <div style={{ marginTop: 4 }}>
            <p style={s.statLabel}>Số dư nền tảng</p>
            <p
              style={{
                ...s.statValue,
                fontSize: 18,
                color: "#185FA5",
                marginBottom: 10,
              }}
            >
              {fmt(platformBalance.balance)}
            </p>
            <div
              style={{
                padding: "5px 10px",
                background: "#EAF3DE",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#3B6D11", fontWeight: 500 }}>
                Thu (32%):
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#3B6D11" }}>
                {fmt(platformBalance.totalEarned)}
              </span>
            </div>
          </div>
          <div style={{ ...s.iconBox, background: "#E6F1FB" }}>
            <i
              className="bi bi-bank2"
              style={{ color: "#185FA5", fontSize: 18 }}
            />
          </div>
        </div>
      </div>

      {/* Chart panel */}
      <div style={s.card}>
        <div
          style={{
            display: "flex",
            gap: 6,
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: 14,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={tabStyle(tab === t.id)}
            >
              <i className={t.icon} /> {t.label}
            </button>
          ))}
        </div>

        {/* Theo ngày */}
        {tab === "day" && (
          <SplitView
            title="Doanh thu theo ngày"
            icon="bi bi-calendar-day"
            empty={byDay.length === 0}
            chart={
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 11 }}
                    width={55}
                  />
                  <Tooltip
                    formatter={(v) => [fmt(v), "Doanh thu"]}
                    contentStyle={tooltipStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#185FA5"
                    strokeWidth={2.5}
                    dot={{ fill: "#185FA5", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            }
            list={
              <RankList
                items={[...byDay]
                  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                  .slice(0, 8)}
                maxVal={maxDayRev}
                labelKey="date"
                renderMeta={(d) => (d.orders != null ? `${d.orders} đơn` : "")}
              />
            }
          />
        )}

        {/* Theo tháng */}
        {tab === "month" && (
          <SplitView
            title={`Doanh thu theo tháng — ${year}`}
            icon="bi bi-calendar-month"
            empty={byMonth.length === 0}
            chart={
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={byMonth}
                  margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 11 }}
                    width={55}
                  />
                  <Tooltip
                    formatter={(v) => [fmt(v), "Doanh thu"]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {byMonth.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.revenue > 0 ? "#378ADD" : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            }
            list={
              <RankList
                items={[...byMonth]
                  .filter((m) => m.revenue > 0)
                  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                  .slice(0, 8)}
                maxVal={maxMonthRev}
                labelKey="label"
                renderMeta={(m) => (m.orders != null ? `${m.orders} đơn` : "")}
              />
            }
          />
        )}

        {/* Theo chi nhánh */}
        {tab === "branch" && (
          <SplitView
            title="Doanh thu theo chi nhánh"
            icon="bi bi-shop"
            empty={byBranch.length === 0}
            chart={
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={byBranch}
                  margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="branchName"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      v.length > 14 ? v.slice(0, 14) + "…" : v
                    }
                  />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={{ fontSize: 11 }}
                    width={55}
                  />
                  <Tooltip
                    formatter={(v) => [fmt(v), "Doanh thu"]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {byBranch.map((_, i) => (
                      <Cell
                        key={i}
                        fill={BRANCH_COLORS[i % BRANCH_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            }
            list={
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[...byBranch]
                  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                  .map((b, i) => {
                    const pct = Math.round((b.revenue / maxBranchRev) * 100);
                    const rc = RANK_COLORS[i] || {
                      bg: "#F1F5F9",
                      color: "#64748b",
                    };
                    const bColor = BRANCH_COLORS[i % BRANCH_COLORS.length];
                    return (
                      <div
                        key={b.branchId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: rc.bg,
                            color: rc.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: bColor,
                                  flexShrink: 0,
                                  display: "inline-block",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {b.branchName}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}
                            >
                              <span
                                className="badge bg-secondary"
                                style={{ fontSize: 11 }}
                              >
                                {b.orders} đơn
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#185FA5",
                                }}
                              >
                                {fmt(b.revenue)}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              height: 5,
                              borderRadius: 3,
                              background: "#f1f5f9",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 3,
                                width: `${pct}%`,
                                background:
                                  i === 0
                                    ? `linear-gradient(90deg, ${bColor}BB, ${bColor})`
                                    : `${bColor}70`,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            }
          />
        )}

        {/* Top sách */}
        {tab === "book" && (
          <>
            <h6 style={s.chartTitle}>
              <i className="bi bi-book" style={{ color: "#185FA5" }} /> Top 10
              sách bán chạy nhất
            </h6>
            {byBook.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {byBook.map((b, i) => {
                  const pct = Math.round((b.revenue / maxBookRev) * 100);
                  const rc = RANK_COLORS[i] || {
                    bg: "#F1EFE8",
                    color: "#5F5E5A",
                  };
                  return (
                    <div
                      key={b.bookId}
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: rc.bg,
                          color: rc.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1e293b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {b.bookTitle}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexShrink: 0,
                              marginLeft: 12,
                            }}
                          >
                            <span
                              className="badge bg-success"
                              style={{ fontSize: 11 }}
                            >
                              {b.totalSold} cuốn
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#185FA5",
                              }}
                            >
                              {fmt(b.revenue)}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "#f1f5f9",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 3,
                              width: `${pct}%`,
                              background:
                                i === 0
                                  ? "linear-gradient(90deg, #185FA5, #378ADD)"
                                  : "#B5D4F4",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── SplitView layout: chart trái, rank list phải ── */
function SplitView({ title, icon, empty, chart, list }) {
  return (
    <>
      <h6 style={s.chartTitle}>
        <i className={icon} style={{ color: "#185FA5" }} /> {title}
      </h6>
      {empty ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", gap: 28, alignItems: "start" }}>
          <div
            style={{
              flex: "0 0 58%",
              width: "58%",
              background: "#fafcff",
              borderRadius: 12,
              padding: "16px 12px 8px",
              border: "1px solid #f1f5f9",
            }}
          >
            {chart}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Xếp hạng theo doanh thu
            </p>
            {list}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Generic rank list (dùng cho ngày + tháng) ── */
function RankList({ items, maxVal, labelKey, renderMeta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const pct = Math.round(((item.revenue || 0) / maxVal) * 100);
        const rc = RANK_COLORS[i] || { bg: "#F1F5F9", color: "#64748b" };
        const meta = renderMeta(item);
        return (
          <div
            key={item[labelKey] ?? i}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: rc.bg,
                color: rc.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item[labelKey]}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {meta && (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {meta}
                    </span>
                  )}
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#185FA5" }}
                  >
                    {fmt(item.revenue)}
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  background: "#f1f5f9",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${pct}%`,
                    background:
                      i === 0
                        ? "linear-gradient(90deg, #185FA5, #378ADD)"
                        : "#B5D4F4",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-muted py-5">
      <i className="bi bi-inbox fs-3 d-block mb-2" />
      Không có dữ liệu trong khoảng thời gian này
    </div>
  );
}

const s = {
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "16px 20px",
    border: "1px solid #e2e8f0",
  },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "18px 20px",
    border: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    minHeight: 110,
  },
  statLabel: {
    margin: "0 0 6px",
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
  },
  statValue: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  statSub: { margin: 0, fontSize: 11, color: "#cbd5e1" },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fg: { display: "flex", alignItems: "center", gap: 6 },
  fl: { fontSize: 13, color: "#64748b", whiteSpace: "nowrap" },
  primaryBtn: {
    background: "#185FA5",
    borderColor: "#185FA5",
    color: "#fff",
    fontSize: 13,
    height: 34,
    padding: "0 14px",
  },
  quickBtn: {
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 12,
    cursor: "pointer",
    height: 34,
  },
  chartTitle: {
    fontWeight: 700,
    marginBottom: 20,
    color: "#111827",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

function tabStyle(active) {
  return {
    padding: "7px 14px",
    borderRadius: 8,
    border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "linear-gradient(135deg, #185FA5, #378ADD)" : "#fff",
    color: active ? "#fff" : "#64748b",
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: active
      ? "0 2px 8px rgba(24,95,165,0.25)"
      : "0 1px 2px rgba(0,0,0,0.04)",
    transition: "all 0.15s ease",
    height: 36,
  };
}
