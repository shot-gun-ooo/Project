<template>
  <div class="home-page">
    <AppHeader  />
    <QuickMenu  />
    <NoticeList />
    <BottomNav  />
  </div>
</template>

<script setup>

import AppHeader  from '@/components/common/AppHeader.vue'
import QuickMenu  from '@/components/common/QuickMenu.vue'
import NoticeList from '@/components/common/NoticeList.vue'
import BottomNav  from '@/components/common/BottomNav.vue'
import { useTodoListStore } from '@/stores/todoList.js'

// 홈 진입 시 Todo 목록 미리 불러오기
useTodoListStore().fetchTodoList()
</script>
