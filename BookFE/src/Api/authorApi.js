import api from "./axiosClient";

export const getAuthors = () => api.get("/authors");

export const getAuthor = (id) => api.get(`/authors/${id}`);

export const createAuthor = (data) => api.post("/authors", data);

export const updateAuthor = (id, data) => api.put(`/authors/${id}`, data);

export const deleteAuthor = (id) => api.delete(`/authors/${id}`);
