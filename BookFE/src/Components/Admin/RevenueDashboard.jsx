import { useEffect, useState, useCallback, useRef } from "react";
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

/* ── Helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return String(Math.round(n));
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
    money: false,
  },
  {
    key: "totalRevenue",
    label: "Tổng doanh thu",
    sub: "Sau thanh toán",
    icon: "bi bi-cash-stack",
    bg: "#EAF3DE",
    color: "#3B6D11",
    money: true,
  },
  {
    key: "totalAuthor",
    label: "Thu nhập tác giả",
    sub: "68% doanh thu",
    icon: "bi bi-person-badge",
    bg: "#FAEEDA",
    color: "#854F0B",
    money: true,
  },
  {
    key: "totalPlatform",
    label: "Thu nhập nền tảng",
    sub: "32% doanh thu",
    icon: "bi bi-building",
    bg: "#EEEDFE",
    color: "#534AB7",
    money: true,
  },
];

const BRANCH_COLORS = ["#185FA5", "#1D9E75", "#BA7517", "#D4537E", "#7F77DD"];
const RANK_COLORS = [
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
];

const QUICK_FILTERS = [
  { label: "Hôm nay", days: 0 },
  { label: "7 ngày", days: 7 },
  { label: "Tháng này", days: 30 },
];

const TABS = [
  { id: "day", label: "Theo ngày", icon: "bi bi-calendar-day" },
  { id: "month", label: "Theo tháng", icon: "bi bi-calendar-month" },
  { id: "branch", label: "Chi nhánh", icon: "bi bi-shop" },
  { id: "book", label: "Top sách", icon: "bi bi-book" },
];

const tooltipStyle = {
  borderRadius: 10,
  border: "none",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  fontSize: 12,
  background: "#fff",
};

/* ── Animated counter hook ── */
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const from = 0;
    const run = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + ease * target));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

/* ── Animated stat card ── */
function StatCard({ card, value }) {
  const animated = useCountUp(Number(value || 0));
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...s.statCard,
        transform: hovered ? "translateY(-3px) scale(1.01)" : "none",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        borderColor: hovered ? "#cbd5e1" : "#f1f5f9",
        transition:
          "transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p style={s.statLabel}>{card.label}</p>
        <p style={s.statValue}>
          {card.money
            ? animated.toLocaleString("vi-VN") + " đ"
            : animated.toLocaleString("vi-VN")}
        </p>
        <p style={s.statSub}>{card.sub}</p>
      </div>
      <div
        style={{
          ...s.iconBox,
          background: card.bg,
          transform: hovered ? "rotate(-5deg) scale(1.12)" : "none",
          transition: "transform 0.2s ease",
        }}
      >
        <i className={card.icon} style={{ color: card.color, fontSize: 17 }} />
      </div>
    </div>
  );
}

/* ── Platform balance card ── */
function PlatformCard({ balance, earned }) {
  const animBal = useCountUp(Number(balance || 0));
  const animEarned = useCountUp(Number(earned || 0));
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...s.statCard,
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-3px) scale(1.01)" : "none",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        borderColor: hovered ? "#cbd5e1" : "#f1f5f9",
        transition:
          "transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "#185FA5",
          borderRadius: "12px 12px 0 0",
        }}
      />
      <div style={{ marginTop: 4 }}>
        <p style={s.statLabel}>Số dư nền tảng</p>
        <p
          style={{
            ...s.statValue,
            fontSize: 17,
            color: "#185FA5",
            marginBottom: 8,
          }}
        >
          {animBal.toLocaleString("vi-VN")} đ
        </p>
        <div
          style={{
            padding: "4px 9px",
            background: "#EAF3DE",
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 10, color: "#3B6D11", fontWeight: 500 }}>
            Thu (32%):
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#3B6D11" }}>
            {animEarned.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>
      <div
        style={{
          ...s.iconBox,
          background: "#E6F1FB",
          transform: hovered ? "rotate(-5deg) scale(1.12)" : "none",
          transition: "transform 0.2s ease",
        }}
      >
        <i className="bi bi-bank2" style={{ color: "#185FA5", fontSize: 17 }} />
      </div>
    </div>
  );
}

/* ── Animated progress bar ── */
function ProgressBar({ pct, color, gradient }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return (
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
          width: `${width}%`,
          background: gradient
            ? `linear-gradient(90deg, #185FA5, #378ADD)`
            : color || "#B5D4F4",
          transition: "width 0.6s cubic-bezier(.34,1,.64,1)",
        }}
      />
    </div>
  );
}

/* ── Rank item (day / month) ── */
function RankItem({ item, index, maxVal, labelKey, renderMeta }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.max(3, Math.round(((item.revenue || 0) / maxVal) * 100));
  const rc = RANK_COLORS[index] || { bg: "#F1F5F9", color: "#64748b" };
  const meta = renderMeta(item);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        transform: hovered ? "translateX(3px)" : "none",
        transition: "transform 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...s.rankNum, background: rc.bg, color: rc.color }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span style={s.rankLabel}>{item[labelKey]}</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {meta && <span style={s.badgeGray}>{meta}</span>}
            <span style={s.rankVal}>{fmt(item.revenue)}</span>
          </div>
        </div>
        <ProgressBar pct={pct} gradient={index === 0} color="#B5D4F4" />
      </div>
    </div>
  );
}

/* ── SplitView layout ── */
function SplitView({ title, icon, empty, chart, list }) {
  return (
    <>
      <h6 style={s.chartTitle}>
        <i className={icon} style={{ color: "#185FA5" }} /> {title}
      </h6>
      {empty ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", gap: 24, alignItems: "start" }}>
          <div style={s.chartWrap}>{chart}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Xếp hạng theo doanh thu
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Branch rank item ── */
function BranchItem({ b, index, maxVal }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.max(3, Math.round(((b.revenue || 0) / maxVal) * 100));
  const rc = RANK_COLORS[index] || { bg: "#F1F5F9", color: "#64748b" };
  const bc = BRANCH_COLORS[index % BRANCH_COLORS.length];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        transform: hovered ? "translateX(3px)" : "none",
        transition: "transform 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...s.rankNum, background: rc.bg, color: rc.color }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: bc,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={s.rankLabel}>{b.branchName}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <span style={s.badgeGray}>{b.orders} đơn</span>
            <span style={s.rankVal}>{fmt(b.revenue)}</span>
          </div>
        </div>
        <ProgressBar pct={pct} gradient={index === 0} color={`${bc}70`} />
      </div>
    </div>
  );
}

/* ── Book item ── */
function BookItem({ b, index, maxVal }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.max(3, Math.round(((b.revenue || 0) / maxVal) * 100));
  const rc = RANK_COLORS[index] || { bg: "#F1EFE8", color: "#5F5E5A" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 11px",
        borderRadius: 8,
        border: `0.5px solid ${hovered ? "#e2e8f0" : "transparent"}`,
        background: hovered ? "#f8fafc" : "transparent",
        transform: hovered ? "translateX(2px)" : "none",
        transition: "all 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          ...s.rankNum,
          width: 26,
          height: 26,
          background: rc.bg,
          color: rc.color,
        }}
      >
        {index + 1}
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
          <span style={s.rankLabel}>{b.bookTitle}</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            <span style={s.badgeGreen}>{b.totalSold} cuốn</span>
            <span style={s.rankVal}>{fmt(b.revenue)}</span>
          </div>
        </div>
        <ProgressBar pct={pct} gradient={index === 0} color="#B5D4F4" />
      </div>
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

/* ── Main component ── */
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
  const [tabKey, setTabKey] = useState(0); // force re-mount for animation

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
      setTabKey((k) => k + 1);
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

  const handleTabChange = (id) => {
    setTab(id);
    setTabKey((k) => k + 1);
  };

  const maxDayRev = Math.max(...byDay.map((b) => b.revenue || 0), 1);
  const maxMonthRev = Math.max(...byMonth.map((b) => b.revenue || 0), 1);
  const maxBranchRev = Math.max(...byBranch.map((b) => b.revenue || 0), 1);
  const maxBookRev = Math.max(...byBook.map((b) => b.revenue || 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              style={{ width: 138, fontSize: 12 }}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div style={s.fg}>
            <span style={s.fl}>Đến</span>
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 138, fontSize: 12 }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={load}
            disabled={loading}
            style={s.primaryBtn}
          >
            <i
              className={`bi ${loading ? "bi-arrow-clockwise spin" : "bi-arrow-clockwise"}`}
            />
            {loading ? "Đang tải..." : "Cập nhật"}
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {QUICK_FILTERS.map((q) => (
              <button
                key={q.label}
                onClick={() => applyQuickFilter(q.days)}
                style={s.quickBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
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
          gap: 12,
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard key={card.key} card={card} value={summary[card.key]} />
        ))}
        <PlatformCard
          balance={platformBalance.balance}
          earned={platformBalance.totalEarned}
        />
      </div>

      {/* Chart panel */}
      <div style={s.card}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: 14,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              style={tabStyle(tab === t.id)}
              onMouseEnter={(e) => {
                if (tab !== t.id) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (tab !== t.id) e.currentTarget.style.background = "#fff";
              }}
            >
              <i className={t.icon} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab panel with slide-in animation */}
        <div key={tabKey} style={{ animation: "slideIn 0.22s ease" }}>
          {/* Theo ngày */}
          {tab === "day" && (
            <SplitView
              title="Doanh thu theo ngày"
              icon="bi bi-calendar-day"
              empty={byDay.length === 0}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11 }}
                      width={52}
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
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={700}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
              list={[...byDay]
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                .slice(0, 8)
                .map((d, i) => (
                  <RankItem
                    key={d.date}
                    item={d}
                    index={i}
                    maxVal={maxDayRev}
                    labelKey="date"
                    renderMeta={(d) =>
                      d.orders != null ? `${d.orders} đơn` : ""
                    }
                  />
                ))}
            />
          )}

          {/* Theo tháng */}
          {tab === "month" && (
            <SplitView
              title={`Doanh thu theo tháng — ${year}`}
              icon="bi bi-calendar-month"
              empty={byMonth.length === 0}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byMonth}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11 }}
                      width={52}
                    />
                    <Tooltip
                      formatter={(v) => [fmt(v), "Doanh thu"]}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="revenue"
                      radius={[5, 5, 0, 0]}
                      animationDuration={700}
                      animationEasing="ease-out"
                    >
                      {byMonth.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.revenue > 0 ? "#185FA5" : "#e2e8f0"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              }
              list={[...byMonth]
                .filter((m) => m.revenue > 0)
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                .slice(0, 8)
                .map((m, i) => (
                  <RankItem
                    key={m.label}
                    item={m}
                    index={i}
                    maxVal={maxMonthRev}
                    labelKey="label"
                    renderMeta={(m) =>
                      m.orders != null ? `${m.orders} đơn` : ""
                    }
                  />
                ))}
            />
          )}

          {/* Theo chi nhánh */}
          {tab === "branch" && (
            <SplitView
              title="Doanh thu theo chi nhánh"
              icon="bi bi-shop"
              empty={byBranch.length === 0}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...byBranch].sort((a, b) => b.revenue - a.revenue)}
                    margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="branchName"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        v.length > 12 ? v.slice(0, 12) + "…" : v
                      }
                    />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11 }}
                      width={52}
                    />
                    <Tooltip
                      formatter={(v) => [fmt(v), "Doanh thu"]}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="revenue"
                      radius={[5, 5, 0, 0]}
                      animationDuration={700}
                      animationEasing="ease-out"
                    >
                      {[...byBranch]
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((_, i) => (
                          <Cell
                            key={i}
                            fill={BRANCH_COLORS[i % BRANCH_COLORS.length]}
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              }
              list={[...byBranch]
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                .map((b, i) => (
                  <BranchItem
                    key={b.branchId}
                    b={b}
                    index={i}
                    maxVal={maxBranchRev}
                  />
                ))}
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
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {byBook.map((b, i) => (
                    <BookItem
                      key={b.bookId}
                      b={b}
                      index={i}
                      maxVal={maxBookRev}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .spin {
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
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
    padding: "16px 18px",
    border: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 100,
    cursor: "default",
  },
  statLabel: {
    margin: "0 0 6px",
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 500,
  },
  statValue: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  statSub: { margin: 0, fontSize: 11, color: "#cbd5e1" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fg: { display: "flex", alignItems: "center", gap: 6 },
  fl: { fontSize: 12, color: "#64748b", whiteSpace: "nowrap" },
  primaryBtn: {
    background: "#185FA5",
    borderColor: "#185FA5",
    color: "#fff",
    fontSize: 12,
    height: 32,
    padding: "0 14px",
    transition: "background 0.15s",
  },
  quickBtn: {
    padding: "5px 11px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 11,
    cursor: "pointer",
    height: 32,
    transition: "all 0.15s",
  },
  chartTitle: {
    fontWeight: 700,
    marginBottom: 18,
    color: "#111827",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  chartWrap: {
    flex: "0 0 58%",
    width: "58%",
    minWidth: 0,
    background: "#fafcff",
    borderRadius: 12,
    padding: "14px 10px 8px",
    border: "1px solid #f1f5f9",
    height: 290,
  },
  rankNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rankVal: { fontSize: 12, fontWeight: 700, color: "#185FA5" },
  badgeGray: {
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 4,
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 500,
  },
  badgeGreen: {
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 4,
    background: "#EAF3DE",
    color: "#3B6D11",
    fontWeight: 500,
  },
};

function tabStyle(active) {
  return {
    padding: "6px 14px",
    borderRadius: 8,
    border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "#185FA5" : "#fff",
    color: active ? "#fff" : "#64748b",
    fontWeight: 500,
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    boxShadow: active ? "0 2px 8px rgba(24,95,165,0.2)" : "none",
    transition: "all 0.15s ease",
    height: 34,
  };
}
