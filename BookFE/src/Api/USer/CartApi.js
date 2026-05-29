import axios from "axios";

const BASE = "http://localhost:8080/api/user/cart";

// 1. Tạo một instance riêng cho Axios (tránh ảnh hưởng đến các cấu hình axios global khác)
const cartAxios = axios.create();

// 2. Cấu hình Interceptor để LUÔN LUÔN lấy token mới nhất trước khi gửi request đi
cartAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Thay thế 'axios' bằng 'cartAxios' trong các hàm của bạn (Không cần truyền getHeaders nữa!)
export const getCart = () => cartAxios.get(BASE);

export const addToCart = (bookId, quantity = 1) =>
  cartAxios.post(BASE, { bookId, quantity });

export const updateCartItem = (cartItemId, quantity) =>
  cartAxios.put(`${BASE}/${cartItemId}`, { quantity });

export const removeCartItem = (cartItemId) =>
  cartAxios.delete(`${BASE}/${cartItemId}`);

export const clearCart = () => cartAxios.delete(BASE);
