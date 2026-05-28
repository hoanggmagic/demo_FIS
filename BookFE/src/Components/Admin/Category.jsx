import { useState, useEffect, useCallback } from "react";
import { categoryApi } from "../api/categoryApi";

export function useCategories() {
  const [tree, setTree] = useState([]);
  const [flat, setFlat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeData, flatData] = await Promise.all([
        categoryApi.getTree(),
        categoryApi.getAll(),
      ]);
      setTree(treeData);
      setFlat(flatData);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createCategory = async (data) => {
    await categoryApi.create(data);
    await fetchAll();
  };

  const updateCategory = async (id, data) => {
    await categoryApi.update(id, data);
    await fetchAll();
  };

  const deleteCategory = async (id) => {
    await categoryApi.delete(id);
    await fetchAll();
  };

  return {
    tree, // dùng cho CategoryTree (render cây)
    flat, // dùng cho CategorySelect, CategoryForm (dropdown)
    loading,
    error,
    refetch: fetchAll,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
