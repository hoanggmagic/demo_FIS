import { useState, useEffect, useCallback } from "react";
import { bookCategoryApi } from "../api/bookCategoryApi";

export function useBookCategories(bookId) {
  // Lưu mảng id của các category đang được gán cho book
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookCategories = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookCategoryApi.getByBook(bookId);
      // data trả về là mảng category object, lấy ra mảng id
      setSelectedIds(data.map((c) => c.id));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookCategories();
  }, [fetchBookCategories]);

  // Toggle 1 category (dùng cho checkbox trong BookCategorySelector)
  const toggleCategory = (categoryId) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // Lưu toàn bộ danh sách đã chọn lên server
  const saveCategories = async () => {
    if (!bookId) return;
    setSaving(true);
    setError(null);
    try {
      await bookCategoryApi.updateAll(bookId, selectedIds);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    selectedIds, // mảng id đang được tick — truyền vào BookCategorySelector
    loading, // đang fetch lần đầu
    saving, // đang gọi save lên server
    error,
    toggleCategory, // dùng khi user tick/bỏ tick 1 checkbox
    saveCategories, // gọi khi bấm nút Lưu
    setSelectedIds, // dùng khi cần set thẳng (ví dụ reset form)
  };
}
