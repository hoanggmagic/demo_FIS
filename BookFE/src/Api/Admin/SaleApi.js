import axios from "axios";

const BASE = "http://localhost:8080/api/admin/books";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const setSale = (bookId, data) =>
  axios.put(`${BASE}/${bookId}/sale`, data, { headers: getHeaders() });

export const removeSale = (bookId) =>
  axios.delete(`${BASE}/${bookId}/sale`, { headers: getHeaders() });
