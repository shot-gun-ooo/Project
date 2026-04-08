<template>
  <li :class="todoItem.done ? 'list-group-item list-group-item-success' : 'list-group-item'">

    <!-- 클릭 시 완료 토글 -->
    <span :class="todoItem.done ? 'todo-done pointer' : 'pointer'" @click="toggleDone(todoItem.id)">
      {{ todoItem.todo }}
      {{ todoItem.done ? '(완료)' : '' }}
    </span>

    <span class="float-end badge bg-secondary pointer m-1"
      @click="router.push({ name: 'todos/edit', params: { id: todoItem.id } })">
      편집
    </span>

    <span class="float-end badge bg-danger pointer m-1" @click="deleteTodo(todoItem.id)">
      삭제
    </span>
  </li>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useTodoListStore } from '@/stores/todoList.js'

// defineProps: 부모에서 전달받는 데이터 정의
defineProps({
  todoItem: { type: Object, required: true }
})

const router = useRouter()
const { deleteTodo, toggleDone } = useTodoListStore()
</script>
