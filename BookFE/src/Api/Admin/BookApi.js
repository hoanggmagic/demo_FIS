import api from "../api";

const API = "/admin/books";

export const getBooks = () => api.get(API);

export const getBookById = (id) => api.get(`${API}/${id}`);

// CREATE
export const createBook = (formData) => api.post(API, formData);
// KHÔNG set Content-Type — axios tự set multipart + boundary

// UPDATE
export const updateBook = (id, formData) => api.put(`${API}/${id}`, formData);
// KHÔNG set Content-Type — axios tự set multipart + boundary

export const deleteBook = (id) => api.delete(`${API}/${id}`);
