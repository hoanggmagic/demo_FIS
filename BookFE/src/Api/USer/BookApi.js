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
  priceFilter = null, // ← thêm
  specialFilter = null, // ← thêm
) => {
  const params = {
    page,
    size,
  };

  if (keyword) params.keyword = keyword;
  if (categoryIds) params.categoryIds = categoryIds;
  if (priceFilter) params.priceFilter = priceFilter;
  if (specialFilter) params.specialFilter = specialFilter;

  return axios.get(`${BASE}/books`, getAuthConfig(params));
};

export const getBookById = (id) =>
  axios.get(`${BASE}/books/${id}`, getHeaders());
