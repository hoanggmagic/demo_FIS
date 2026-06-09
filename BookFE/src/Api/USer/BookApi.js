import axios from "axios";

const BASE = "http://localhost:8080/api/user";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// GET BOOKS PHÂN TRANG
export const getBooks = (
  page = 0,
  size = 12,
  keyword = "",
  categoryId = null,
) => {
  let url = `${BASE}/books?page=${page}&size=${size}`;

  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }

  return axios.get(url, getHeaders());
};

export const getBookById = (id) =>
  axios.get(`${BASE}/books/${id}`, getHeaders());
