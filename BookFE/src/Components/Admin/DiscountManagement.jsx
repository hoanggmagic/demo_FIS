import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/admin/discounts";
const BOOKS_API = "http://localhost:8080/api/admin/books";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    bookId: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });
  const [message, setMessage] = useState("");

  // Quản lý từ khóa tìm kiếm và ẩn/hiện bảng gợi ý
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hàm load dữ liệu từ API
  const load = async () => {
    try {
      const [discountRes, bookRes] = await Promise.all([
        axios.get(API, getHeaders()),
        axios.get(BOOKS_API, getHeaders()),
      ]);
      setDiscounts(discountRes.data || []);
      setBooks(bookRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu hệ thống:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Tự động ẩn danh sách gợi ý khi click chuột ra bất kỳ vùng trống nào bên ngoài
  useEffect(() => {
    const closeDropdown = () => setShowSuggestions(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const getBookTitle = (bookId) =>
    books.find((b) => b.id === bookId)?.title || "Không rõ";

  const resetForm = () => {
    setForm({
      bookId: "",
      discountPercent: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
    });
    setSearchTerm("");
    setEditItem(null);
    setShowForm(false);
    setMessage("");
  };

  const handleEdit = (d) => {
    setEditItem(d);
    setForm({
      bookId: d.bookId,
      discountPercent: d.discountPercent,
      startDate: d.startDate?.replace(" ", "T").slice(0, 16),
      endDate: d.endDate?.replace(" ", "T").slice(0, 16),
      status: d.status,
    });
    const currentTitle = books.find((b) => b.id === d.bookId)?.title || "";
    setSearchTerm(currentTitle);
    setShowForm(true);
  };

  // ĐÃ GỘP VÀ XỬ LÝ LỖI TRÁNH BỊ [OBJECT OBJECT]
  const handleSubmit = async () => {
    if (!form.bookId) {
      setMessage("❌ Vui lòng nhập và chọn một cuốn sách từ danh sách gợi ý!");
      return;
    }

    try {
      const payload = {
        bookId: Number(form.bookId),
        discountPercent: Number(form.discountPercent),
        startDate: form.startDate.includes("T")
          ? form.startDate.replace("T", " ") + ":00"
          : form.startDate,
        endDate: form.endDate.includes("T")
          ? form.endDate.replace("T", " ") + ":00"
          : form.endDate,
        status: form.status,
      };

      if (editItem) {
        await axios.put(`${API}/${editItem.id}`, payload, getHeaders());
        setMessage("✅ Cập nhật thành công!");
      } else {
        await axios.post(API, payload, getHeaders());
        setMessage("✅ Tạo discount thành công!");
      }
      load();
      setTimeout(resetForm, 1500);
    } catch (err) {
      const errorData = err.response?.data;

      if (errorData) {
        // Nếu trường hợp Backend trả về object map chứa chi tiết lỗi validation
        if (typeof errorData === "object") {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          setMessage(`❌ Lỗi nhập liệu: ${errorMessages}`);
        } else {
          // Nếu Backend trả về chuỗi text thuần túy
          setMessage(`❌ Lỗi: ${errorData}`);
        }
      } else {
        setMessage(`❌ Lỗi hệ thống: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa discount này?")) return;
    try {
      await axios.delete(`${API}/${id}`, getHeaders());
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (s) =>
    ({ ACTIVE: "#22c55e", INACTIVE: "#94a3b8" })[s] || "#94a3b8";

  const isExpired = (endDate) => new Date(endDate) < new Date();
  const isUpcoming = (startDate) => new Date(startDate) > new Date();

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h5 style={{ margin: 0, fontWeight: 700 }}>🏷️ Quản lý giảm giá</h5>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Tổng: {discounts.length} chương trình giảm giá
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          + Thêm giảm giá
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h6 style={{ fontWeight: 700, marginBottom: 16 }}>
            {editItem ? "✏️ Chỉnh sửa giảm giá" : "➕ Thêm giảm giá mới"}
          </h6>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div
              style={{ position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <label style={labelStyle}>Sách cần giảm giá</label>
              <input
                type="text"
                className="form-control"
                placeholder="Gõ tên sách để tìm kiếm... (Ví dụ: Toán)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) setForm({ ...form, bookId: "" });
                }}
                onFocus={() => setShowSuggestions(true)}
                disabled={!!editItem}
                style={inputStyle}
              />

              {showSuggestions && searchTerm && !editItem && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 50,
                    padding: 0,
                    margin: "4px 0 0",
                    listStyle: "none",
                  }}
                >
                  {books
                    .filter((b) =>
                      b.title.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((b) => (
                      <li
                        key={b.id}
                        onClick={() => {
                          setForm({ ...form, bookId: b.id });
                          setSearchTerm(b.title);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#334155",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f1f5f9")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        📖 {b.title}{" "}
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>
                          (ID: {b.id})
                        </span>
                      </li>
                    ))}

                  {books.filter((b) =>
                    b.title.toLowerCase().includes(searchTerm.toLowerCase()),
                  ).length === 0 && (
                    <li
                      style={{
                        padding: "12px 14px",
                        color: "#94a3b8",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                    >
                      ❌ Không tìm thấy sách nào khớp trong hệ thống!
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div>
              <label style={labelStyle}>Phần trăm giảm (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.discountPercent}
                onChange={(e) =>
                  setForm({ ...form, discountPercent: e.target.value })
                }
                placeholder="VD: 10"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={form.startDate?.slice(0, 16)}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={form.endDate?.slice(0, 16)}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={inputStyle}
              />
            </div>
            {editItem && (
              <div>
                <label style={labelStyle}>Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}
          </div>

          {message && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: message.includes("✅") ? "#ecfdf5" : "#fef2f2",
                color: message.includes("✅") ? "#16a34a" : "#dc2626",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={handleSubmit}
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {editItem ? "💾 Cập nhật" : "➕ Tạo mới"}
            </button>
            <button
              onClick={resetForm}
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {[
                "ID",
                "Sách",
                "Giảm giá",
                "Bắt đầu",
                "Kết thúc",
                "Trạng thái",
                "Thao tác",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}
                >
                  Chưa có chương trình giảm giá nào.
                </td>
              </tr>
            ) : (
              discounts.map((d) => {
                const expired = isExpired(d.endDate);
                const upcoming = isUpcoming(d.startDate);
                return (
                  <tr
                    key={d.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td style={tdStyle}>#{d.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {getBookTitle(d.bookId)}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#d97706",
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        -{d.discountPercent}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: "#64748b" }}>
                      {new Date(d.startDate).toLocaleString("vi-VN")}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: 13,
                        color: expired ? "#ef4444" : "#64748b",
                      }}
                    >
                      {new Date(d.endDate).toLocaleString("vi-VN")}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: statusColor(d.status) + "20",
                          color: statusColor(d.status),
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {expired
                          ? "Hết hạn"
                          : upcoming
                            ? "Sắp diễn ra"
                            : d.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleEdit(d)}
                          style={{
                            background: "#eff6ff",
                            color: "#3b82f6",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          style={{
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  background: "#f8fafc",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};
const tdStyle = { padding: "12px 16px", fontSize: 14, color: "#1e293b" };
