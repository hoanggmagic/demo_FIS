import { useState } from "react";
import { useCategories } from "../../api/hooks/useCategories";

export default function CategoryManagement() {
  const {
    tree,
    flat,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", parentId: "" });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", parentId: "" });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parent?.id || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      parentId: form.parentId || null,
    };
    if (editing) {
      await updateCategory(editing.id, data);
    } else {
      await createCategory(data);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    await deleteCategory(id);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-danger">Lỗi: {error}</p>;

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted" style={{ fontSize: 14 }}>
          {Array.isArray(flat) ? flat.length : 0} danh mục
        </span>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Thêm danh mục
        </button>
      </div>

      {/* Form tạo / sửa */}
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title mb-3">
              {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h6>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Tên danh mục *</label>
                  <input
                    className="form-control form-control-sm"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mô tả</label>
                  <input
                    className="form-control form-control-sm"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Danh mục cha</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.parentId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, parentId: e.target.value }))
                    }
                  >
                    <option value="">— Không có (danh mục gốc) —</option>
                    {Array.isArray(flat) &&
                      flat
                        .filter((c) => c.id !== editing?.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  {editing ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cây danh mục */}
      <div className="card">
        <div className="card-body p-0">
          <CategoryTree
            tree={Array.isArray(tree) ? tree : []}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

// ── Render cây đệ quy ─────────────────────────────────────────────────────────

function CategoryTree({ tree = [], onEdit, onDelete, depth = 0 }) {
  if (!Array.isArray(tree) || tree.length === 0)
    return <p className="text-muted text-center py-4">Chưa có danh mục nào.</p>;

  return (
    <ul className="list-group list-group-flush">
      {tree.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function CategoryNode({ node, onEdit, onDelete, depth }) {
  const [open, setOpen] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <>
      <li
        className="list-group-item d-flex align-items-center gap-2"
        style={{ paddingLeft: 16 + depth * 24 }}
      >
        {hasChildren ? (
          <button
            className="btn btn-link p-0 text-muted"
            style={{ fontSize: 12, minWidth: 16 }}
            onClick={() => setOpen((v) => !v)}
          >
            <i className={`bi bi-chevron-${open ? "down" : "right"}`} />
          </button>
        ) : (
          <span style={{ minWidth: 16 }} />
        )}

        <i className="bi bi-tag text-primary" style={{ fontSize: 13 }} />

        <span style={{ flex: 1, fontSize: 14 }}>{node.name}</span>

        {node.description && (
          <span className="text-muted" style={{ fontSize: 12 }}>
            {node.description}
          </span>
        )}

        <span
          className="badge bg-light text-muted border"
          style={{ fontSize: 11 }}
        >
          {node.children?.length ?? 0} danh mục con
        </span>

        <button
          className="btn btn-outline-primary btn-sm py-0 px-2"
          onClick={() => onEdit(node)}
        >
          <i className="bi bi-pencil" />
        </button>
        <button
          className="btn btn-outline-danger btn-sm py-0 px-2"
          onClick={() => onDelete(node.id)}
        >
          <i className="bi bi-trash" />
        </button>
      </li>

      {hasChildren && open && (
        <CategoryTree
          tree={node.children}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
        />
      )}
    </>
  );
}
