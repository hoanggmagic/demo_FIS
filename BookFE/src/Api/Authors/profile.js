import api from "../axiosClient";

export const getAuthors = () => api.get("/admin/authors");

export const getAuthor = (id) => api.get(`/admin/authors/${id}`);

export const createAuthor = (data) => api.post("/admin/authors", data);

export const updateAuthor = (id, data) => api.put(`/admin/authors/${id}`, data);

export const deleteAuthor = (id) => api.delete(`/admin/authors/${id}`);
