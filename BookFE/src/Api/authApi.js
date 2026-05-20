import api from "./axiosClient";

export const login = (username, password) =>
  api.post("/auth/login", { username, password });

export const getMe = () => api.get("/auth/me");
