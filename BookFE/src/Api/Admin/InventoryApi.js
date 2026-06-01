import axios from "axios";

const BASE = "http://localhost:8080/api/admin/inventory";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getInventory = () => axios.get(BASE, getHeaders());
export const getBranches = () => axios.get(`${BASE}/branches`, getHeaders());
export const upsertInventory = (bookId, branchId, quantity) =>
  axios.post(BASE, { bookId, branchId, quantity }, getHeaders());
