<template>
  <header class="kb-header">
    <div class="header-left">
      <h2 class="page-title">홈 (대시보드)</h2>
    </div>
    <div class="header-right">
      <div class="header-btn-group">
        <div
          class="user-info-btn login-btn"
          v-if="!isLoggedIn"
          @click="goToLogin">
          <span class="user-name">로그인 🔑</span>
        </div>
        <div
          class="user-info-btn logout-btn"
          v-if="isLoggedIn"
          @click="handleLogout">
          <span class="user-name">로그아웃 🔓</span>
        </div>
        <div
          class="user-info-btn mypage-btn"
          v-if="isLoggedIn"
          @click="goToMyPage">
          <span class="user-name">{{ userName }}님의 페이지 👤</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { getUserInfo, logoutProcess } from '../../utils/authutil';

const router = useRouter();

const userName = ref('');
const isLoggedIn = ref(false); // 로그인 상태값
const userInfo = getUserInfo();

// 로그인 상태 체크 함수
const checkLoginStatus = () => {
  isLoggedIn.value = userInfo.authenticated;
  if (userInfo.authenticated) {
    userName.value = userInfo.name;
  } else {
    userName.value = '로그인이 필요합니다';
  }
};

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push({ name: 'users/login' });
};

// 프로필 클릭 시 동작
const goToMyPage = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'users/my', params: { id: userInfo.id } });
  } else {
    router.push({ name: 'users/login' });
  }
};

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    logoutProcess(() => {
      isLoggedIn.value = false;
      window.location.href = '/';
    });
  }
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: transparent;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
.header-btn-group {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}
.user-info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: white;
  padding: 8px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}
.user-info-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.user-name {
  font-size: 14px;
  color: #555;
  font-weight: 600;
}
.user-avatar {
  font-size: 18px;
}

@media (max-width: 1100px) {
  .kb-header {
    padding: 20px;
  }
}
</style>
