import api from "../api";

const API = "/admin/books";

export const getBooks = () => api.get(API);
export const getBookById = (id) => api.get(`${API}/${id}`);
export const createBook = (data) => api.post(API, data);
export const updateBook = (id, data) => api.put(`${API}/${id}`, data);
export const deleteBook = (id) => api.delete(`${API}/${id}`);
