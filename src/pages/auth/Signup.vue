<template>
  <div class="signup-wrapper">
    <div class="signup-container">
      <div class="signup-main-title">회원가입</div>

      <div class="header-section">
        <div class="sub-title">계정 생성</div>
        <div class="sub-desc">앱에 가입하려면 이메일을 입력하세요</div>
      </div>

      <input
        v-model="name"
        type="text"
        class="signup-input"
        placeholder="이름을 입력하세요" />

      <input
        v-model="userid"
        type="text"
        class="signup-input"
        placeholder="아이디를 입력하세요" />
      <p
        v-if="userid.length > 0 && !isIdValid"
        style="color: red; font-size: 11px">
        아이디는 영문 소문자와 숫자 조합으로 4~12자여야 합니다.
      </p>

      <input
        v-model="email"
        type="email"
        class="signup-input"
        placeholder="이메일를 입력하세요" />
      <p
        v-if="email.length > 0 && !isEmailValid"
        style="color: red; font-size: 11px">
        이메일 형식에 맞게 입력해야 합니다.
      </p>

      <input
        v-model="password"
        type="password"
        class="signup-input"
        placeholder="비밀번호를 입력하세요" />
      <p
        v-if="password.length > 0 && !ispasswordValid"
        style="color: red; font-size: 11px">
        비밀번호는 영문 소문자와 숫자 조합으로 4~12자여야 합니다.
      </p>

      <div class="agreement-text">
        '가입하기'를 클릭함으로써, <strong>이용약관</strong> 및 <br />
        <strong>개인정보 처리방침</strong>에 동의하는 것으로 간주됩니다
      </div>

      <button class="signup-btn" @click="handleSignup">
        이메일로 가입하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 입력 상태 관리
const name = ref('');
const userid = ref('');
const email = ref('');
const password = ref('');

// 아이디 형식 검사
const isIdValid = computed(() => {
  const idRegex = /^[a-z0-9]{4,12}$/;
  return idRegex.test(userid.value);
});

// 이메일 형식 검사
const isEmailValid = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.value);
});

// 비밀번호 형식 검사
const ispasswordValid = computed(() => {
  const passwordRegex = /^[a-z0-9]{4,12}$/;
  return passwordRegex.test(userid.value);
});

const handleSignup = async () => {
  // 1. 모든 항목이 입력되었는지 확인.
  if (!name.value || !userid.value || !email.value || !password.value) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  // 2. 회원가입
  try {
    await axios.post('/api/users', {
      name: name.value,
      userid: userid.value,
      email: email.value,
      password: password.value,
      roles: ['users'],
    });

    alert('회원가입이 완료되었습니다! 로그인 해주세요.');
    router.push({ name: 'users/login' }); // 가입 성공 시 로그인 화면으로 이동
  } catch (error) {
    alert('회원가입 중 오류가 발생했습니다.');
  }

  // 가입이 완료되었는지 확인하기 위한 것.
  // console.log('가입 시도:', {
  //   name: name.value,
  //   userid: userid.value,
  //   email: email.value,
  //   password: password.value,
  // });
  // alert('회원가입 버튼 클릭됨!');
};
</script>

<style scoped>
/* 화면 중앙 정렬 래퍼 */
.signup-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic',
    sans-serif;
}

/* 폼 컨테이너 */
.signup-container {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 최상단 '회원가입' 타이틀 */
.signup-main-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 50px;
  color: #000000;
}

/* 서브 타이틀 영역 (계정 생성 부분) */
.header-section {
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
}

.sub-title {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.sub-desc {
  font-size: 12px;
  color: #666666;
}

/* 입력 창 공통 스타일 */
.signup-input {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 12px;
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  color: #333333;
}

.signup-input::placeholder {
  color: #b0b0b0;
}

.signup-input:focus {
  outline: none;
  border-color: #cccccc;
}

/* 약관 동의 텍스트 */
.agreement-text {
  width: 100%;
  font-size: 11px;
  color: #888888;
  text-align: center;
  line-height: 1.5;
  margin-top: 4px;
  margin-bottom: 20px;
}

.agreement-text strong {
  color: #555555;
  font-weight: bold;
}

/* 가입 버튼 */
.signup-btn {
  width: 100%;
  padding: 13px;
  background-color: #9be0ff; /* 이미지의 파스텔 톤 블루 */
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
