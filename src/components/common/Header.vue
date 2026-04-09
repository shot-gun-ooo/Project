<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// 마이페이지 이동
const goToMyPage = () => {
  router.push("/users/my/:id");
};

// 로그인 페이지 이동
const goToLogin = () => {
  router.push("/users/login");
};
</script>

<template>
  <header class="kb-header">
    <div class="header-left">
      <h2 class="page-title">홈 (대시보드)</h2>
    </div>
    <div class="header-right">
      <div class="header-btn-group">
        <div class="user-info-btn login-btn" @click="goToLogin">
          <span class="user-name">로그인</span>
          <div class="user-avatar">🔑</div>
        </div>

        <div class="user-info-btn mypage-btn" @click="goToMyPage">
          <span class="user-name">이승진 Page</span>
          <div class="user-avatar">👤</div>
        </div>
      </div>
    </div>
  </header>
</template>

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

/* 버튼들을 감싸는 그룹 */
.header-right {
  display: flex;
  align-items: center;
}
.header-btn-group {
  display: flex;
  gap: 12px; /* 버튼 사이 간격 */
}

/* 공통 버튼 스타일 */
.user-info-btn {
  display: flex;
  align-items: center;
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

/* 로그인 버튼 강조 (선택 사항) */
.login-btn {
  background-color: #f8f9fa;
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
