import axios from "axios";

const BASE = "http://localhost:8080/api/orders";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const createOrder = (data) =>
  axios.post(`${BASE}/create`, data, getHeaders());

export const getOrderHistory = () => axios.get(BASE, getHeaders());

export const getOrderDetail = (id) => axios.get(`${BASE}/${id}`, getHeaders());
