import axios from "axios";

const BASE = "http://localhost:8080/api/user";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getBooks = () => axios.get(`${BASE}/books`, getHeaders());
export const getBookById = (id) =>
  axios.get(`${BASE}/books/${id}`, getHeaders());
export const searchBooks = (keyword) =>
  axios.get(`${BASE}/books/search?keyword=${keyword}`, getHeaders());
