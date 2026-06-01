import axios from "axios";

const BASE = "http://localhost:8080/api/admin/transfers";

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getTransfers = () => axios.get(BASE, getHeaders());

export const createTransfer = (
  bookId,
  fromBranchId,
  toBranchId,
  quantity,
  note = "",
) =>
  axios.post(
    BASE,
    { bookId, fromBranchId, toBranchId, quantity, note },
    getHeaders(),
  );
