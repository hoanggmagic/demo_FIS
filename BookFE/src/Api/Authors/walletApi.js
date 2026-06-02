import api from "../api";

const BASE = "/author/wallet";

// 📊 số dư
export const getBalance = () => api.get(`${BASE}/balance`);

// 📈 giao dịch
export const getTransactions = () => api.get(`${BASE}/transactions`);

// 📋 lịch sử rút
export const getWithdrawHistory = () => api.get(`${BASE}/withdraw-history`);

// 💸 rút tiền
export const withdrawMoney = (data) => api.post(`${BASE}/withdraw`, data);
