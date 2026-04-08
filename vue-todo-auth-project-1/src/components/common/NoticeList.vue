<template>
  <div class="container pb-4">
    <h5 class="fw-bold mb-3">최근 알림</h5>
    <div
      v-for="notice in notices"
      :key="notice.text"
      class="alert d-flex align-items-center gap-2 rounded-4"
      :class="notice.alertClass"
    >
      <i :class="notice.icon"></i>
      <div>{{ notice.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const notices = ref([
  { text: '오늘 과제 제출 마감입니다.',    icon: 'fa-solid fa-circle-info',  alertClass: 'alert-primary' },
  { text: '출석 체크가 완료되었습니다.',   icon: 'fa-solid fa-circle-check', alertClass: 'alert-success' },
])
</script>
