import api from "../axiosClient";

export const getBooks = () => api.get("/admin/books");

export const getBook = (id) => api.get(`/admin/books/${id}`);

export const createBook = (book) => api.post("/admin/books", book);

export const updateBook = (id, book) => api.put(`/admin/books/${id}`, book);

export const deleteBook = (id) => api.delete(`/admin/books/${id}`);
