import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { getCart } from "../Api/User/CartApi";
import { categoryApi } from "../Api/Admin/CategoryApi";

const parseCategoryIdSet = (value) =>
  new Set(
    (value ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => Number(part))
      .filter((id) => Number.isFinite(id)),
  );

const collectCategoryIds = (node) => {
  const ids = [node.id];
  node.children?.forEach((child) => {
    ids.push(...collectCategoryIds(child));
  });
  return ids;
};

const hasSelectedCategoryInTree = (node, selectedIds) =>
  selectedIds.has(Number(node.id)) ||
  (node.children?.some((child) => hasSelectedCategoryInTree(child, selectedIds)) ??
    false);

// ── Category Sidebar ──────────────────────────────────────────────────────────
function CategorySidebar({ tree, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sidebarRef = useRef();
  const hideTimer = useRef();

  const categoryIdsParam = searchParams.get("categoryIds");
  const priceFilter = searchParams.get("priceFilter");
  const specialFilter = searchParams.get("specialFilter");
  const selectedCategoryIds = parseCategoryIdSet(categoryIdsParam);

  const setFilter = (key, value) => {
    console.log("setFilter called:", key, value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
        next.set("page", "1");
      }
      console.log("navigating to:", `/?${next.toString()}`);
      return next;
    });
  };

  const clearHover = () => {
    hideTimer.current = setTimeout(() => {
      setHoveredL1(null);
      setHoveredL2(null);
    }, 120);
  };

  const keepHover = () => {
    clearTimeout(hideTimer.current);
  };

  const PRICE_RANGES = [
    { label: "Dưới 50.000đ", value: "0-50000" },
    { label: "50.000 – 100.000đ", value: "50000-100000" },
    { label: "100.000 – 200.000đ", value: "100000-200000" },
    { label: "Trên 200.000đ", value: "200000-999999999" },
  ];

  const SPECIAL_FILTERS = [
    { label: "🔥 Bán chạy", value: "bestseller", color: "#ea580c" },
    { label: "🏷️ Đang giảm giá", value: "sale", color: "#16a34a" },
  ];

  const sidebarW = collapsed ? 48 : 220;

  return (
    <div
      ref={sidebarRef}
      style={{
        width: sidebarW,
        minWidth: sidebarW,
        transition: "width .2s, min-width .2s",
        background: "#fff",
        borderRight: "1px solid #e9ecef",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 100,
        overflowX: "visible",
      }}
    >
      {/* Toggle button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "14px 0" : "14px 14px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
            <i className="bi bi-funnel me-2" style={{ color: "#2563eb" }} />
            Danh mục & Lọc
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            fontSize: 16,
            padding: 4,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
          }}
          title={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        >
          <i className={`bi bi-layout-sidebar${collapsed ? "" : "-reverse"}`} />
        </button>
      </div>

      {/* Nội dung sidebar */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {/* ── Danh mục ── */}
          <div
            style={{
              padding: "4px 14px 6px",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Danh mục
          </div>

          {tree.map((cat) => {
            const isActive = hasSelectedCategoryInTree(cat, selectedCategoryIds);
            return (
              <div
                key={cat.id}
                style={{ position: "relative" }}
                onMouseEnter={() => {
                  keepHover();
                  setHoveredL1(cat.id);
                  setHoveredL2(null);
                }}
                onMouseLeave={clearHover}
              >
                <div
                  onClick={() => onSelect(cat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#2563eb" : "#1e293b",
                    background: isActive ? "#eff6ff" : "transparent",
                    borderLeft: isActive
                      ? "3px solid #2563eb"
                      : "3px solid transparent",
                    transition: "all .12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <i
                      className="bi bi-tag"
                      style={{
                        fontSize: 11,
                        color: isActive ? "#2563eb" : "#94a3b8",
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 140,
                      }}
                    >
                      {cat.name}
                    </span>
                  </span>
                  {cat.children?.length > 0 && (
                    <i
                      className="bi bi-chevron-right"
                      style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}
                    />
                  )}
                </div>

                {/* L2 flyout */}
                {hoveredL1 === cat.id && cat.children?.length > 0 && (
                  <div
                    onMouseEnter={keepHover}
                    onMouseLeave={clearHover}
                    style={{
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      background: "#fff",
                      border: "1px solid #e9ecef",
                      borderRadius: 10,
                      boxShadow: "0 8px 32px rgba(0,0,0,.12)",
                      minWidth: 200,
                      zIndex: 500,
                      padding: "6px 0",
                    }}
                  >
                    <div
                      style={{
                        padding: "4px 14px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                      }}
                    >
                      {cat.name}
                    </div>
                    {cat.children.map((child) => (
                      <div
                        key={child.id}
                        style={{ position: "relative" }}
                        onMouseEnter={() => {
                          keepHover();
                          setHoveredL2(child.id);
                        }}
                        onMouseLeave={clearHover}
                      >
                    <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(child);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 14px",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: hasSelectedCategoryInTree(
                              child,
                              selectedCategoryIds,
                            )
                              ? 600
                              : 400,
                            color: hasSelectedCategoryInTree(
                              child,
                              selectedCategoryIds,
                            )
                              ? "#2563eb"
                              : "#1e293b",
                            background: hasSelectedCategoryInTree(
                              child,
                              selectedCategoryIds,
                            )
                              ? "#eff6ff"
                              : "transparent",
                            borderLeft: hasSelectedCategoryInTree(
                              child,
                              selectedCategoryIds,
                            )
                              ? "3px solid #2563eb"
                              : "3px solid transparent",
                            transition: "background .12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              hasSelectedCategoryInTree(
                                child,
                                selectedCategoryIds,
                              )
                                ? "#eff6ff"
                                : "#f0f7ff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = hasSelectedCategoryInTree(
                              child,
                              selectedCategoryIds,
                            )
                              ? "#eff6ff"
                              : "transparent")
                          }
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <i
                              className="bi bi-arrow-return-right"
                              style={{ fontSize: 10, color: "#94a3b8" }}
                            />
                            {child.name}
                          </span>
                          {child.children?.length > 0 && (
                            <i
                              className="bi bi-chevron-right"
                              style={{ fontSize: 10, color: "#94a3b8" }}
                            />
                          )}
                        </div>

                        {/* L3 flyout */}
                        {hoveredL2 === child.id &&
                          child.children?.length > 0 && (
                            <div
                              onMouseEnter={keepHover}
                              onMouseLeave={clearHover}
                              style={{
                                position: "absolute",
                                left: "100%",
                                top: 0,
                                background: "#fff",
                                border: "1px solid #e9ecef",
                                borderRadius: 10,
                                boxShadow: "0 8px 32px rgba(0,0,0,.12)",
                                minWidth: 190,
                                zIndex: 600,
                                padding: "6px 0",
                              }}
                            >
                              <div
                                style={{
                                  padding: "4px 14px 8px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#94a3b8",
                                  textTransform: "uppercase",
                                }}
                              >
                                {child.name}
                              </div>
                              {child.children.map((gc) => (
                                <div
                                  key={gc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(gc);
                                  }}
                                  style={{
                                    padding: "8px 14px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: selectedCategoryIds.has(
                                      Number(gc.id),
                                    )
                                      ? 600
                                      : 400,
                                    color: selectedCategoryIds.has(
                                      Number(gc.id),
                                    )
                                      ? "#2563eb"
                                      : "#1e293b",
                                    background: selectedCategoryIds.has(
                                      Number(gc.id),
                                    )
                                      ? "#eff6ff"
                                      : "transparent",
                                    borderLeft: selectedCategoryIds.has(
                                      Number(gc.id),
                                    )
                                      ? "3px solid #2563eb"
                                      : "3px solid transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    transition: "background .12s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      selectedCategoryIds.has(Number(gc.id))
                                        ? "#eff6ff"
                                        : "#f0f7ff")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      selectedCategoryIds.has(Number(gc.id))
                                        ? "#eff6ff"
                                        : "transparent")
                                  }
                                >
                                  <i
                                    className="bi bi-dot"
                                    style={{ fontSize: 18, color: "#94a3b8" }}
                                  />
                                  {gc.name}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{ margin: "12px 14px", borderTop: "1px solid #f1f5f9" }}
          />

          {/* ── Lọc đặc biệt ── */}
          <div
            style={{
              padding: "4px 14px 6px",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Nổi bật
          </div>
          {SPECIAL_FILTERS.map((f) => {
            const active = specialFilter === f.value;
            return (
              <div
                key={f.value}
                onClick={() => setFilter("specialFilter", f.value)}
                style={{
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? f.color : "#1e293b",
                  background: active ? "#fff7ed" : "transparent",
                  borderLeft: active
                    ? `3px solid ${f.color}`
                    : "3px solid transparent",
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {f.label}
              </div>
            );
          })}

          <div
            style={{ margin: "12px 14px", borderTop: "1px solid #f1f5f9" }}
          />

          {/* ── Lọc giá ── */}
          <div
            style={{
              padding: "4px 14px 6px",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Khoảng giá
          </div>
          {PRICE_RANGES.map((r) => {
            const active = priceFilter === r.value;
            return (
              <div
                key={r.value}
                onClick={() => setFilter("priceFilter", r.value)}
                style={{
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#2563eb" : "#1e293b",
                  background: active ? "#eff6ff" : "transparent",
                  borderLeft: active
                    ? "3px solid #2563eb"
                    : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <i
                  className="bi bi-currency-dollar"
                  style={{
                    fontSize: 12,
                    color: active ? "#2563eb" : "#94a3b8",
                  }}
                />
                {r.label}
              </div>
            );
          })}

          {/* Clear all filters */}
          {(categoryIdsParam || priceFilter || specialFilter) && (
            <div style={{ padding: "12px 14px" }}>
              <button
                onClick={() => setSearchParams({})}
                style={{
                  width: "100%",
                  padding: "7px",
                  border: "1px dashed #e2e8f0",
                  borderRadius: 8,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#94a3b8",
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2563eb";
                  e.currentTarget.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                <i className="bi bi-x-circle me-1" /> Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed icons */}
      {collapsed && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 8,
            gap: 4,
          }}
        >
          {tree.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              title={cat.name}
              onClick={() => onSelect(cat)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 16,
                padding: "6px",
                borderRadius: 6,
              }}
            >
              <i className="bi bi-tag" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Category Mega Menu (navbar) ───────────────────────────────────────────────
function CategoryMenu({ onSelect, tree }) {
  const [activeParent, setActiveParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveParent(null);
        setActiveChild(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!tree.length) return null;

  const colStyle = (active) => ({
    minWidth: 200,
    padding: "8px 0",
    borderRight: active ? "1px solid #f0f0f0" : "none",
  });
  const itemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#2563eb" : "#1e293b",
    background: isActive ? "#eff6ff" : "transparent",
    borderRadius: 6,
    margin: "0 6px",
    transition: "all .15s",
  });

  return (
    <li className="nav-item position-relative" ref={ref}>
      <button
        className="nav-link fw-medium text-dark d-flex align-items-center gap-1"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        onClick={() => {
          setOpen((v) => !v);
          setActiveParent(null);
          setActiveChild(null);
        }}
      >
        <i className="bi bi-tags me-1" /> Danh mục
        <i
          className={`bi bi-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 10 }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 2000,
            background: "#fff",
            border: "1px solid #e9ecef",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,.12)",
            display: "flex",
            minWidth: 220,
          }}
        >
          <div style={colStyle(!!activeParent)}>
            {tree.map((cat) => (
              <div
                key={cat.id}
                style={itemStyle(activeParent?.id === cat.id)}
                onMouseEnter={() => {
                  setActiveParent(cat);
                  setActiveChild(null);
                }}
                onClick={() => {
                  onSelect(cat);
                  setOpen(false);
                  setActiveParent(null);
                  setActiveChild(null);
                }}
              >
                <span>
                  <i
                    className="bi bi-tag me-2"
                    style={{ fontSize: 11, color: "#94a3b8" }}
                  />
                  {cat.name}
                </span>
                {cat.children?.length > 0 && (
                  <i
                    className="bi bi-chevron-right"
                    style={{ fontSize: 10, color: "#94a3b8" }}
                  />
                )}
              </div>
            ))}
          </div>
          {activeParent?.children?.length > 0 && (
            <div style={colStyle(!!activeChild)}>
              <div
                style={{
                  padding: "6px 16px 8px",
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {activeParent.name}
              </div>
              {activeParent.children.map((child) => (
                <div
                  key={child.id}
                  style={itemStyle(activeChild?.id === child.id)}
                  onMouseEnter={() => setActiveChild(child)}
                  onClick={() => {
                    onSelect(child);
                    setOpen(false);
                    setActiveParent(null);
                    setActiveChild(null);
                  }}
                >
                  <span>
                    <i
                      className="bi bi-arrow-return-right me-2"
                      style={{ fontSize: 11, color: "#94a3b8" }}
                    />
                    {child.name}
                  </span>
                  {child.children?.length > 0 && (
                    <i
                      className="bi bi-chevron-right"
                      style={{ fontSize: 10, color: "#94a3b8" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {activeChild?.children?.length > 0 && (
            <div style={colStyle(false)}>
              <div
                style={{
                  padding: "6px 16px 8px",
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {activeChild.name}
              </div>
              {activeChild.children.map((gc) => (
                <div
                  key={gc.id}
                  style={{
                    padding: "9px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1e293b",
                    borderRadius: 6,
                    margin: "0 6px",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eff6ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    onSelect(gc);
                    setOpen(false);
                    setActiveParent(null);
                    setActiveChild(null);
                  }}
                >
                  <i
                    className="bi bi-dot me-1"
                    style={{ fontSize: 16, color: "#94a3b8" }}
                  />
                  {gc.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  user,
  onLogout,
  onShowLogin,
  cartCount,
  onSelectCategory,
  categoryTree,
}) {
  const navigate = useNavigate();
  const [ddOpen, setDdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg bg-white shadow-sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1030,
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <div className="container-fluid px-3">
        <NavLink
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
        >
          <i
            className="bi bi-book-half"
            style={{ fontSize: 22, color: "#3b7ddd" }}
          />
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e" }}>
            Digital Books
          </span>
        </NavLink>
        <button
          className="navbar-toggler border-0"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-5`} />
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link fw-medium${isActive ? " text-primary" : " text-dark"}`
                }
              >
                <i className="bi bi-grid me-1" /> Danh sách sách
              </NavLink>
            </li>
            <CategoryMenu onSelect={onSelectCategory} tree={categoryTree} />
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-link fw-medium d-flex align-items-center gap-1 position-relative${isActive ? " text-primary" : " text-dark"}`
                }
              >
                <i className="bi bi-cart3" /> Giỏ hàng
                {cartCount > 0 && (
                  <span
                    className="badge rounded-pill bg-danger"
                    style={{ fontSize: 10 }}
                  >
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `nav-link fw-medium${isActive ? " text-primary" : " text-dark"}`
                  }
                >
                  <i className="bi bi-person me-1" /> Hồ sơ
                </NavLink>
              </li>
            )}
          </ul>
          {user ? (
            <div className="position-relative">
              <button
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  borderRadius: 20,
                  background: "#f8f9fa",
                  border: "1px solid #dee2e6",
                }}
                onClick={() => setDdOpen((v) => !v)}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#3b7ddd",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {user.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.fullName}
                </span>
                <i className="bi bi-chevron-down" style={{ fontSize: 10 }} />
              </button>
              {ddOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 999 }}
                    onClick={() => setDdOpen(false)}
                  />
                  <ul
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: 10,
                      minWidth: 180,
                      padding: "6px 0",
                      listStyle: "none",
                      margin: 0,
                      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                    }}
                  >
                    <li
                      style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#6c757d" }}>
                        Đăng nhập với
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {user.fullName}
                      </div>
                    </li>
                    <li>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 16px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#333",
                        }}
                        onClick={() => {
                          setDdOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <i className="bi bi-person" /> Hồ sơ cá nhân
                      </button>
                    </li>
                    <li
                      style={{ borderTop: "1px solid #f0f0f0", marginTop: 4 }}
                    >
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 16px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#dc3545",
                        }}
                        onClick={() => {
                          setDdOpen(false);
                          onLogout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right" /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                style={{ borderRadius: 20 }}
                onClick={onShowLogin}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ categoryTree }) {
  const navigate = useNavigate();
  return (
    <footer
      style={{
        background: "#1a1a2e",
        color: "#adb5bd",
        padding: "40px 0 20px",
      }}
    >
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i
                className="bi bi-book-half"
                style={{ fontSize: 20, color: "#3b7ddd" }}
              />
              <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
                Digital Books
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Nền tảng sách số hàng đầu Việt Nam — kết nối tác giả và độc giả.
            </p>
          </div>
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>
              Danh mục
            </h6>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}
            >
              {categoryTree.map((cat) => (
                <li key={cat.id} style={{ marginBottom: 6 }}>
                  <button
                  onClick={() => {
                      const ids = collectCategoryIds(cat);
                      navigate(
                        `/?categoryIds=${ids.join(",")}&categoryName=${encodeURIComponent(cat.name)}`,
                      );
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#adb5bd",
                      fontSize: 13,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#adb5bd")
                    }
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>
              Hỗ trợ
            </h6>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}
            >
              {[
                "Câu hỏi thường gặp",
                "Chính sách đổi trả",
                "Liên hệ chúng tôi",
                "Điều khoản sử dụng",
              ].map((c) => (
                <li key={c} style={{ marginBottom: 6 }}>
                  <a
                    href="#"
                    style={{ color: "#adb5bd", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) => (e.target.style.color = "#adb5bd")}
                  >
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #2d2d4e",
            paddingTop: 16,
            fontSize: 12,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>
            &copy; {new Date().getFullYear()} Digital Books. All rights
            reserved.
          </span>
          <div className="d-flex gap-3">
            {["bi-facebook", "bi-twitter-x", "bi-instagram"].map((ic) => (
              <a
                key={ic}
                href="#"
                style={{ color: "#adb5bd" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#adb5bd")}
              >
                <i className={`bi ${ic}`} style={{ fontSize: 16 }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Layout wrapper ────────────────────────────────────────────────────────────
export default function UserLayout({ user, onLogout, onShowLogin, children }) {
  const [cartCount, setCartCount] = useState(0);
  const [categoryTree, setCategoryTree] = useState([]);
  const navigate = useNavigate();
  const displayedCartCount = user ? cartCount : 0;

  useEffect(() => {
    categoryApi
      .getTree()
      .then(setCategoryTree)
      .catch(() => setCategoryTree([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    getCart()
      .then((res) => setCartCount(res.data.length))
      .catch(() => setCartCount(0));
  }, [user]);

  const handleSelectCategory = (cat) => {
    const ids = collectCategoryIds(cat);
    navigate(
      `/?categoryIds=${ids.join(",")}&categoryName=${encodeURIComponent(cat.name)}`,
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8f9fa",
      }}
    >
      <Navbar
        user={user}
        onLogout={onLogout}
        onShowLogin={onShowLogin}
        cartCount={displayedCartCount}
        onSelectCategory={handleSelectCategory}
        categoryTree={categoryTree}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <CategorySidebar tree={categoryTree} onSelect={handleSelectCategory} />
        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {children}
        </main>
      </div>
      <Footer categoryTree={categoryTree} />
    </div>
  );
}
