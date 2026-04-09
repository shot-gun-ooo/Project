// 로그인 / 로그아웃 / 권한 체크 / 프로필 사진 유틸 함수 모음
// 사용자 데이터는 json-server(/api/users)에서 관리
import axios from 'axios';

const USERS_URI = '/api/users';

// ==============================
// 1. 경로별 접근 권한 정의
// ==============================
const routesToRoles = [
  { name: 'users/login', roles: ['everybody'] },
  { name: 'users/signup', roles: ['everybody'] },
  { name: 'users/my', roles: ['users'] },
  { name: 'dashboard', roles: ['users'] },
  { name: 'trans', roles: ['users'] },
  { name: 'budget', roles: ['users'] },
  { name: 'wishlist', roles: ['users'] },
];

// ==============================
// 2. 로그인 세션 저장 (localStorage)
// ==============================
// 저장 내용: authenticated, id, userid, roles
// 프로필 이미지 경로는 포함하지 않음 (조회 시마다 서버에서 가져옴)
const setUserInfo = (userInfo) => {
  if (userInfo && userInfo.authenticated) {
    //
    const encodedData = btoa(encodeURIComponent(JSON.stringify(userInfo)));
    window.localStorage.setItem('userInfo', encodedData);
  } else {
    window.localStorage.removeItem('userInfo');
  }
};

// ==============================
// 3. 로그인 세션 조회
// ==============================
const getUserInfo = () => {
  const str = window.localStorage.getItem('userInfo');
  if (!str) return { authenticated: false };

  try {
    //
    return JSON.parse(decodeURIComponent(window.atob(str)));
  } catch (e) {
    console.error('세션 복호화 실패:', e);
    return { authenticated: false };
  }
};

// ==============================
// 4. 로그인 처리
// ==============================
// json-server는 쿼리 파라미터로 필터링 가능
// GET /api/users?userid=user1&password=1234
const loginProcess = async (
  userid,
  password,
  successCallback,
  failCallback,
) => {
  try {
    const response = await axios.get(USERS_URI, {
      params: { userid, password },
    });

    if (response.data.length > 0) {
      const user = response.data[0];
      setUserInfo({
        authenticated: true,
        id: user.id,
        userid: user.userid,
        name: user.name,
        roles: user.roles,
      });
      successCallback();
    } else {
      if (failCallback) failCallback();
    }
  } catch (error) {
    alert('로그인 중 오류가 발생했습니다: ' + error);
  }
};

// ==============================
// 5. 로그아웃 처리
// ==============================
const logoutProcess = (callback) => {
  setUserInfo(null);
  callback();
};

// ==============================
// 6. 프로필 사진 경로 저장
// ==============================
// 이미지 파일은 public/uploads/profile/ 에 저장
// db.json에는 "/uploads/profile/파일명" 경로 문자열만 저장
// PATCH: 해당 필드만 부분 업데이트
// 공식 문서(axios): https://axios-http.com/kr/docs/api_intro
const saveProfileImagePath = async (userId, imagePath) => {
  try {
    await axios.patch(`${USERS_URI}/${userId}`, { profileImage: imagePath });
  } catch (error) {
    alert('프로필 사진 저장 중 오류가 발생했습니다: ' + error);
  }
};

// ==============================
// 7. 사용자 정보 전체 조회 (프로필 이미지 경로 포함)
// ==============================
const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`${USERS_URI}/${userId}`);
    return response.data;
  } catch {
    return null;
  }
};

// ==============================
// 8. 경로 접근 가능 여부 판단
// ==============================
const isMatchToRoles = (routeName) => {
  // 경로 이름이 없거나 권한 정의 목록에 없으면 기본적으로 접근 허용 (보안 취약점 방지보다 사용성 우선)
  if (!routeName) return true;
  const route = routesToRoles.find((r) => r.name === routeName);
  if (!route) return true;

  if (routeName === 'notfound') return true;

  const userInfo = getUserInfo();

  if (!userInfo.authenticated) {
    return route.roles.includes('everybody');
  }

  if (route.roles.includes('everybody')) return true;

  return userInfo.roles.some((role) => route.roles.includes(role));
};

export {
  isMatchToRoles,
  loginProcess,
  logoutProcess,
  getUserInfo,
  saveProfileImagePath,
  fetchUserById,
};
