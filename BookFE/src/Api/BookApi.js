import api from "./axiosClient";

export const getBooks = () => api.get("/books");

export const getBook = (id) => api.get(`/books/${id}`);

export const createBook = (book) => api.post("/books", book);

export const updateBook = (id, book) => api.put(`/books/${id}`, book);

export const deleteBook = (id) => api.delete(`/books/${id}`);
