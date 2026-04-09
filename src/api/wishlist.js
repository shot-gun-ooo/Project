import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export const getWishlists = () => axios.get(`${BASE_URL}/wishlists`);
export const getWishlistById = (id) => axios.get(`${BASE_URL}/wishlists/${id}`);
export const createWishlist = (data) =>
  axios.post(`${BASE_URL}/wishlists`, data);
export const deleteWishlist = (id) =>
  axios.delete(`${BASE_URL}/wishlists/${id}`);
export const updateSavedAmount = (id, savedAmount) =>
  axios.patch(`${BASE_URL}/wishlists/${id}`, { savedAmount });
