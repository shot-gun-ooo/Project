<template>
  <div class="app-wrapper">
    <Sidebar />

    <div class="main-layout">
      <Header />

      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "./components/common/Sidebar.vue";
import Header from "./components/common/Header.vue";
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: "Pretendard", sans-serif;
  background-color: #f8f9fa; /* 시안의 연한 회색 배경 */
}
.app-wrapper {
  display: flex;
}
.main-layout {
  flex-grow: 1;
  margin-left: 260px; /* 사이드바 너비만큼 띄우기 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
}
.page-content {
  flex-grow: 1;
  padding: 0 40px 40px 40px; /* 상단바 제외하고 좌우하단 여백 */
}

/* 웹 반응형 대응 */
@media (max-width: 1100px) {
  .main-layout {
    margin-left: 85px;
  }
  .page-content {
    padding: 0 20px 20px 20px;
  }
}
</style>
