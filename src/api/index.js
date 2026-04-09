import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 2000,
});

export const api = {
  getTransactions: (params) => http.get("/transactions", { params }),
  getBudgets: (params) => http.get("/budgets", { params }),
};

export const budgetApi = {
  getBudget: (userId) => api.getBudgets({ userId, period: "current" }),
  createBudget: (data) => http.post("/budgets", data),
  updateBudget: (id, data) => http.patch(`/budgets/${id}`, data),
};

export const transactionApi = {
  getExpenses: (userId) => api.getTransactions({ userId, type: "expense" }),
};
