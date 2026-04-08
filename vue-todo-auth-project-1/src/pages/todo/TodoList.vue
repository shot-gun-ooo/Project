<template>
  <MainLayout>
  <div>
    <AppHeader />

    <div class="container py-3">
      <div class="row">
        <div class="col p-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">할일 목록</h5>
          <div>
            <router-link class="btn btn-primary btn-sm me-1" :to="{ name: 'todos/add' }">
              할일 추가
            </router-link>
            <button class="btn btn-outline-secondary btn-sm" @click="fetchTodoList">
              새로 고침
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <ul class="list-group">
            <TodoItem v-for="todoItem in todoList" :key="todoItem.id" :todoItem="todoItem" />
          </ul>
        </div>
        <div class="mt-2 text-secondary small px-3">
          완료된 할일: {{ doneCount }}
        </div>
      </div>
    </div>

 
  </div>
     </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTodoListStore } from '@/stores/todoList.js'
import TodoItem from '@/components/todo/TodoItem.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import MainLayout from '@/components/common/MainLayout.vue'

const todoListStore = useTodoListStore()
const { fetchTodoList } = todoListStore
const doneCount = computed(() => todoListStore.doneCount)
const todoList = computed(() => todoListStore.todoList)

// 페이지 진입 / 새로고침 시 목록 재조회
onMounted(async () => {
  await fetchTodoList()
})
</script>
