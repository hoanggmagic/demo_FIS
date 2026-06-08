import api from "../axiosClient";

const BASE = "/admin/revenue";

export const getSummary = (from, to) =>
  api.get(`${BASE}/summary`, { params: { from, to } });
export const getByDay = (from, to) =>
  api.get(`${BASE}/by-day`, { params: { from, to } });
export const getByMonth = (year) =>
  api.get(`${BASE}/by-month`, { params: { year } });
export const getByBranch = (from, to) =>
  api.get(`${BASE}/by-branch`, { params: { from, to } });
export const getByBook = (from, to) =>
  api.get(`${BASE}/by-book`, { params: { from, to } });
export const getPlatformBalance = () => api.get(`${BASE}/platform-balance`);
