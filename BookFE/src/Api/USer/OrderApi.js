import axios from "axios";

const BASE = "http://localhost:8080/api/orders"; // ✅ đúng

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const createOrder = (orderPayload) =>
  axios.post(`${BASE}/create`, orderPayload, getHeaders()); // ✅ /api/orders/create
