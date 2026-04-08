<template>
  <div class="container text-center py-5">
    <i class="fa-solid fa-circle-exclamation fa-3x text-secondary mb-3"></i>
    <h4 class="fw-bold">페이지를 찾을 수 없습니다.</h4>
    <p class="text-secondary">요청하신 페이지가 존재하지 않습니다.</p>
    <button class="btn btn-primary" @click="router.replace({ name: 'home' })">
      홈으로 이동
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
