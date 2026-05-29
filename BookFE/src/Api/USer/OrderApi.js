import axios from "axios";

const BASE = "http://localhost:8080/api/user/cart";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getCart = () => axios.get(BASE, getHeaders());
export const addToCart = (bookId, quantity = 1) =>
  axios.post(BASE, { bookId, quantity }, getHeaders());
export const updateCartItem = (cartItemId, quantity) =>
  axios.put(`${BASE}/${cartItemId}`, { quantity }, getHeaders());
export const removeCartItem = (cartItemId) =>
  axios.delete(`${BASE}/${cartItemId}`, getHeaders());
export const clearCart = () => axios.delete(BASE, getHeaders());
console.log("CART RAW:", cart);
