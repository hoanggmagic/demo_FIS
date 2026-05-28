import axios from "/aip";

const BASE = "/api/books";

export const bookCategoryApi = {
  // Lấy danh sách category của 1 book
  getByBook: (bookId) =>
    axios.get(`${BASE}/${bookId}/categories`).then((r) => r.data),

  // Gán category vào book (bookId + categoryId = composite key)
  add: (bookId, categoryId) =>
    axios
      .post(`${BASE}/${bookId}/categories/${categoryId}`)
      .then((r) => r.data),

  // Xóa category khỏi book
  remove: (bookId, categoryId) =>
    axios.delete(`${BASE}/${bookId}/categories/${categoryId}`),

  // Cập nhật toàn bộ danh sách category cho book (gửi mảng categoryId)
  updateAll: (bookId, categoryIds) =>
    axios
      .put(`${BASE}/${bookId}/categories`, { categoryIds })
      .then((r) => r.data),
};
