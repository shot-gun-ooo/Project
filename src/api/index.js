import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const api = {
  getTransactions: (params) => http.get('/transactions', { params }),
  getBudgets: (params) => http.get('/budgets', { params }),
};

export const budgetApi = {
  getBudget: (userid) => http.get(`/budgets?userid=${userid}`),
  createBudget: (data) => http.post('/budgets', data),
  updateBudget: (id, data) => http.patch(`/budgets/${id}`, data),
};

export const transactionApi = {
  getExpenses: (userid) =>
    http.get(`/transactions?userid=${userid}&type=expense`),
};
