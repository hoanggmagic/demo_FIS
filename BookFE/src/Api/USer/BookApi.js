import axios from "axios";

const BASE = "http://localhost:8080/api/user";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const getAuthConfig = (params = {}) => ({
  ...getHeaders(),
  params,
});

export const getBooks = (
  page = 0,
  size = 12,
  keyword = "",
  categoryIds = null,
  priceFilter = null,
  specialFilter = null,
) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (categoryIds) params.categoryIds = categoryIds;
  if (priceFilter) params.priceFilter = priceFilter;
  if (specialFilter) params.specialFilter = specialFilter;
  return axios.get(`${BASE}/books`, getAuthConfig(params));
};

export const getBookById = (id) =>
  axios.get(`${BASE}/books/${id}`, getHeaders());

// Lấy danh sách chi nhánh
export const getBranches = () => axios.get(`${BASE}/branches`, getHeaders());

// Lấy tồn kho của 1 sách theo từng chi nhánh
export const getBookStock = (bookId) =>
  axios.get(`${BASE}/books/${bookId}/stock`, getHeaders());
