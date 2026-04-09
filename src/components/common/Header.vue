<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const router = useRouter();
const isLoggedIn = ref(false); // 로그인 상태값

// 로그인 상태 체크 (예: 로컬 스토리지에 유저 정보가 있는지 확인)
const checkLoginStatus = () => {
  const user = localStorage.getItem("user"); // 가이드의 로그인 로직 기반
  isLoggedIn.value = !!user;
};

// 프로필 클릭 시 동작
const handleProfileClick = () => {
  if (isLoggedIn.value) {
    // 로그인 상태면 마이페이지로 이동
    router.push("/mypage");
  } else {
    // 로그아웃 상태면 로그인 페이지로 이동
    router.push("/users/login");
  }
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<template>
  <header class="kb-header">
    <div class="header-left">
      <h2 class="page-title">홈 (대시보드)</h2>
    </div>
    <div class="header-right">
      <div class="user-info-btn" @click="handleProfileClick">
        <span class="user-name">
          {{ isLoggedIn ? "이승진 Page" : "로그인이 필요합니다" }}
        </span>
        <div class="user-avatar">👤</div>
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
/* 버튼처럼 보이도록 스타일 수정 */
.user-info-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 8px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer; /* 마우스 커서를 손가락 모양으로 */
  transition: all 0.2s ease;
}
.user-info-btn:hover {
  transform: translateY(-2px); /* 호버 시 살짝 떠오르는 효과 */
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
