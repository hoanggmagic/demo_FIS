import axios from "axios";
const BASE = "http://localhost:8080/api/admin/inventory";
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
export const getInventory = (search = "", branchId = "", page = 0, size = 10) =>
  axios.get(BASE, {
    ...getHeaders(),
    params: { search, branchId, page, size },
  });
export const getBranches = () => axios.get(`${BASE}/branches`, getHeaders());
export const upsertInventory = (bookId, branchId, quantity) =>
  axios.post(BASE, { bookId, branchId, quantity }, getHeaders());
