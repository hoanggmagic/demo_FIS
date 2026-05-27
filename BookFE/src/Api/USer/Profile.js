import axios from "axios";

const BASE_URL = "http://localhost:8080/api/user";

/**
 * Lấy thông tin profile user hiện tại
 */
export const getUserProfile = async () => {
  return await axios.get(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

/**
 * Cập nhật profile user
 */
export const updateUserProfile = async (id, data) => {
  return await axios.put(`${BASE_URL}/profile/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Đổi mật khẩu user
 */
export const changeUserPassword = async (data) => {
  return await axios.put(`${BASE_URL}/profile/change-password`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
};
