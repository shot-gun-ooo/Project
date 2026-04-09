<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-title">로그인</div>

      <input
        v-model="userid"
        type="text"
        class="login-input"
        placeholder="아이디를 입력하세요" />

      <input
        v-model="password"
        type="password"
        class="login-input"
        placeholder="비밀번호를 입력하세요" />

      <button class="login-btn" @click="handleLogin">로그인</button>
      <button class="signup-btn" @click="handleSignIn">회원가입</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginProcess } from '../../utils/authutil';

const router = useRouter();

const userid = ref('');
const password = ref('');

const handleLogin = () => {
  // 간단한 유효성 검사
  if (!userid.value || !password.value) {
    alert('이메일과 비밀번호를 모두 입력해주세요.');
    return;
  }

  // authutil.js의 loginProcess 호출
  loginProcess(
    userid.value,
    password.value,
    // successCallback: 로그인 성공 시 실행
    () => {
      alert('로그인에 성공했습니다.');
      router.push({ name: 'dashboard' }); // 대시보드로 이동
      window.location.href = '/'; //
    },
    // failCallback: 로그인 실패 시 실행
    () => {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    },
  );
};

const handleSignIn = () => {
  router.push({ name: 'users/signup' });
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic',
    sans-serif;
}
.login-container {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 40px;
  color: #000000;
}
.login-input {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 12px;
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  color: #333333;
}
.login-input::placeholder {
  color: #a0a0a0;
}
.login-input:focus {
  outline: none;
  border-color: #cccccc;
}
.login-btn {
  width: 100%;
  padding: 13px;
  margin-top: 8px;
  background-color: #9be0ff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.login-btn:hover {
  background-color: #8cd1f0;
}
.signup-btn {
  width: 100%;
  padding: 13px;
  margin-top: 8px;
  background-color: #9be0ff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.signup-btn:hover {
  background-color: #8cd1f0;
}
</style>
