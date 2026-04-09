import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // 만약 JSON Server 실행 시 --prefix /api를 썼다면 뒤에 /api 추가

export const getPurchases = () => axios.get(`${BASE_URL}/purchases`);

export const createPurchase = async (data) => {
  // 데이터 전송 전 로그 확인
  console.log('보내는 데이터:', data);
  return await axios.post(`${BASE_URL}/purchases`, data);
};
