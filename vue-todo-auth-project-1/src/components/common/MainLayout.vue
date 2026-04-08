<template>
  <div class="main-layout">
    <!-- 페이지 본문 -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 하단 고정 메뉴 -->
    <BottomNav class="bottom-nav-fixed" />
  </div>
</template>

<script setup>
import BottomNav from '@/components/common/BottomNav.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

/* BottomNav 높이만큼 아래 여백 확보 */
.main-content {
  padding-bottom: 90px;
}

/* 하단 고정 */
.bottom-nav-fixed {
  position: fixed;

  bottom: 0;
  z-index: 1000;
}
</style>