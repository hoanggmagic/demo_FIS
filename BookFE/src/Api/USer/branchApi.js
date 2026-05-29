import axios from "axios";

const BASE = "http://localhost:8080/api/user";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Lấy danh sách chi nhánh
export const getBranches = () =>
  axios.get(`${BASE}/branches`, getHeaders());

// Lấy tồn kho của 1 sách theo từng chi nhánh
export const getBookStock = (bookId) =>
  axios.get(`${BASE}/books/${bookId}/stock`, getHeaders());
