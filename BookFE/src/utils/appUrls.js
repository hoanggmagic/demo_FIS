const RAW_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const API_BASE_URL = RAW_API_BASE.replace(/\/$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export function apiUrl(path = "") {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function bookImageUrl(fileName = "") {
  return `${API_ORIGIN}/uploads/books/${fileName}`;
}

export function userImageUrl(fileName = "") {
  return `${API_ORIGIN}/uploads/users/${fileName}`;
}

