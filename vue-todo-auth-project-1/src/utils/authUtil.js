// 로그인 / 로그아웃 / 세션 / 프로필 사진 유틸 함수 모음
// 사용자 데이터는 json-server(/api/users)에서 관리
import axios from 'axios'

const USERS_URI = '/api/users'

// ==============================
// 1. 로그인 세션 저장 (localStorage)
// ==============================
// 저장 내용: authenticated, id, userid, roles
const setUserInfo = (userInfo) => {
  if (userInfo && userInfo.authenticated) {
    window.localStorage.setItem('userInfo', btoa(JSON.stringify(userInfo)))
  } else {
    window.localStorage.removeItem('userInfo')
  }
}

// ==============================
// 2. 로그인 세션 조회
// ==============================
const getUserInfo = () => {
  const str = window.localStorage.getItem('userInfo')
  if (!str) return { authenticated: false }
  return JSON.parse(window.atob(str))
}

// ==============================
// 3. 로그인 처리
// ==============================
// GET /api/users?userid=user1&password=1234
const loginProcess = async (userid, password, successCallback, failCallback) => {
  try {
    const response = await axios.get(USERS_URI, {
     params: {
    userid: userid.trim(),
    password: password.trim()
  }
    })
console.log('userid:', userid)
console.log('password:', password)
console.log('USERS_URI:', USERS_URI)
    console.log('login response:', response.data)
    if (response.data.length > 0) {
      const user = response.data[0]

      setUserInfo({
        authenticated: true,
        id: user.id,
        userid: user.userid,
        roles: user.roles,
      })

      successCallback()
    } else {
      if (failCallback) failCallback()
    }
  } catch (error) {
    alert('로그인 중 오류가 발생했습니다: ' + error)
  }
}

// ==============================
// 4. 로그아웃 처리
// ==============================
const logoutProcess = (callback) => {
  setUserInfo(null)
  callback()
}

// ==============================
// 5. 프로필 사진 경로 저장
// ==============================
const saveProfileImagePath = async (userId, imagePath) => {
  try {
    await axios.patch(`${USERS_URI}/${userId}`, { profileImage: imagePath })
  } catch (error) {
    alert('프로필 사진 저장 중 오류가 발생했습니다: ' + error)
  }
}

// ==============================
// 6. 사용자 정보 전체 조회
// ==============================
const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`${USERS_URI}/${userId}`)
    return response.data
  } catch {
    return null
  }
}

export {
  getUserInfo,
  loginProcess,
  logoutProcess,
  saveProfileImagePath,
  fetchUserById,
}