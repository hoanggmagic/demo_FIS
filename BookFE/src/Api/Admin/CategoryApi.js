import axiosClient from "../axiosClient";

const BASE = "/categories";

export const categoryApi = {
  getAll: () => axiosClient.get(BASE).then((r) => r.data),

  getTree: () => axiosClient.get(`${BASE}/tree`).then((r) => r.data),

  getById: (id) => axiosClient.get(`${BASE}/${id}`).then((r) => r.data),

  create: (data) => axiosClient.post(BASE, data).then((r) => r.data),

  update: (id, data) =>
    axiosClient.put(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id) => axiosClient.delete(`${BASE}/${id}`),
};
