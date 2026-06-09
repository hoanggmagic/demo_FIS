import api from "../axiosClient";

export const getAuthors = (page = 0, size = 5, keyword = "") =>
  api.get(
    `/admin/authors?page=${page}&size=${size}&keyword=${encodeURIComponent(keyword)}`,
  );

export const getAuthor = (id) => api.get(`/admin/authors/${id}`);

export const createAuthor = (data) => api.post("/admin/authors", data);

export const updateAuthor = (id, data) => api.put(`/admin/authors/${id}`, data);

export const deleteAuthor = (id) => api.delete(`/admin/authors/${id}`);
