import axios from 'axios';

const BASEURI = 'http://127.0.0.1:3000/purchases';

export function getPurchases() {
  return axios.get(BASEURI);
}

export function createPurchase(data) {
  return axios.post(BASEURI, data);
}
