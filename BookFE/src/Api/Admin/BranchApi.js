import axios from "axios";

const BASE = "http://localhost:8080/api/admin/branches";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getBranches = () => axios.get(BASE, getHeaders());
export const createBranch = (data) => axios.post(BASE, data, getHeaders());
export const updateBranch = (id, data) =>
  axios.put(`${BASE}/${id}`, data, getHeaders());
export const deleteBranch = (id) => axios.delete(`${BASE}/${id}`, getHeaders());
