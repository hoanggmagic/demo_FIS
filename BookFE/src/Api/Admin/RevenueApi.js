import axios from "axios";

const BASE = "http://localhost:8080/api/admin/revenue";

export const getSummary = (from, to) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);
  return axios.get(`${BASE}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { from, to },
  });
};

export const getByDay = (from, to) =>
  axios.get(`${BASE}/by-day`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params: { from, to },
  });

export const getByMonth = (year) =>
  axios.get(`${BASE}/by-month`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params: { year },
  });

export const getByBranch = (from, to) =>
  axios.get(`${BASE}/by-branch`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params: { from, to },
  });

export const getByBook = (from, to) =>
  axios.get(`${BASE}/by-book`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params: { from, to },
  });
