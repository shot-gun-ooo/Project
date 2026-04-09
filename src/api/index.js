import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 2000,
});

export const api = {
  getTransactions: (params) => {
    return http.get('/transactions', { params });
  },
  getBudgets: (params) => {
    return http.get('/budgets', { params });
  },
};
