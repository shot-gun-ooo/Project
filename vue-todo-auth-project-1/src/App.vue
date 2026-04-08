<template>
  <div class="container">
    <router-view />
    <!-- isLoading true 일 때만 로딩 오버레이 표시 -->
    <Loading v-if="isLoading" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTodoListStore } from '@/stores/todoList.js'
import Loading from '@/components/common/Loading.vue'

const isLoading = computed(() => useTodoListStore().isLoading)
</script>
