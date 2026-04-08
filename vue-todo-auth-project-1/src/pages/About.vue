<template>
  <div>
    <AppHeader />
    <div class="container py-4">
      <h5 class="fw-bold mb-3">강의</h5>
      <p class="text-secondary">수강 중인 강의 목록이 표시됩니다.</p>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
</script>
