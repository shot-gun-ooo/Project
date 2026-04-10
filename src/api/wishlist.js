import axios from 'axios';

const BASEURI = 'http://localhost:3000/wishlists';

export function getWishlists() {
  return axios.get(BASEURI);
}

export function getWishlistById(id) {
  return axios.get(`${BASEURI}/${id}`);
}

export function createWishlist(data) {
  return axios.post(BASEURI, data);
}

export function updateSavedAmount(id, savedAmount) {
  return axios.patch(`${BASEURI}/${id}`, { savedAmount });
}

export function deleteWishlist(id) {
  return axios.delete(`http://localhost:3000/wishlists/${id}`);
}
