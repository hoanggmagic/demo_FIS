import { useEffect, useState } from "react";
import { createAuthor, updateAuthor } from "../../Api//Admin/authorApi";

const empty = {
  username: "",
  email: "",
  password: "",
  name: "",
  nationality: "",
  biography: "",
};

export default function AuthorForm({ user, onSaved, editing, onCancelEdit }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.role === "AUTHOR";

  useEffect(() => {
    if (editing) {
      setForm({
        username: editing.username || "",
        email: editing.email || "",
        password: "",
        name: editing.name || "",
        nationality: editing.nationality || "",
        biography: editing.biography || "",
      });
    } else if (isAuthor && user) {
      setForm({
        username: user.username,
        email: user.email || "",
        password: "",
        name: user.fullName || "",
        nationality: user.nationality || "",
        biography: user.biography || "",
      });
    } else {
      setForm(empty);
    }
  }, [editing, isAuthor, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isAdmin && !editing) {
        if (!form.username || !form.password || !form.name) {
          setError("Username, mật khẩu và họ tên là bắt buộc");
          return;
        }
        await createAuthor(form);
      } else {
        const id = editing?.id || user.id;
        await updateAuthor(id, {
          name: form.name,
          nationality: form.nationality,
          biography: form.biography,
        });
      }
      setForm(empty);
      onSaved();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      setError(err.response?.data || "Lưu thất bại");
    }
  };

  if (!isAdmin && !isAuthor) return null;

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>
        {editing
          ? "✏️ Sửa tác giả"
          : isAdmin
            ? "➕ Thêm tác giả"
            : "✏️ Hồ sơ tác giả"}
      </h2>

      {isAdmin && !editing && (
        <>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={form.password}
            onChange={handleChange}
          />
        </>
      )}

      <input
        name="name"
        placeholder="Họ tên"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="nationality"
        placeholder="Quốc tịch"
        value={form.nationality}
        onChange={handleChange}
      />
      <textarea
        name="biography"
        placeholder="Tiểu sử"
        value={form.biography}
        onChange={handleChange}
        rows={2}
      />

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-add">
          Lưu
        </button>
        {editing && isAdmin && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancelEdit}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
