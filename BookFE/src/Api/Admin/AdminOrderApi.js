import axios from "axios";

const BASE = "http://localhost:8080/api/admin/orders";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getOrders = (status, from, to) =>
  axios.get(BASE, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    params: { status, from, to },
  });

export const getOrderItems = (id) =>
  axios.get(`${BASE}/${id}/items`, getHeaders());

export const updateOrderStatus = (id, status) =>
  axios.put(`${BASE}/${id}/status`, { status }, getHeaders());
