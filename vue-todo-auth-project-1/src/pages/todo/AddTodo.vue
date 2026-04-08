<template>
  <div class="container py-3">
    <div class="row">
      <div class="col p-3 d-flex align-items-center gap-2">
        <button class="btn btn-light btn-sm rounded-circle" @click="router.back()">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h5 class="fw-bold mb-0">할일 추가</h5>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="form-group mb-3">
          <label class="form-label">할일</label>
          <input type="text" class="form-control" v-model="todoItem.todo" />
        </div>
        <div class="form-group mb-3">
          <label class="form-label">설명</label>
          <textarea class="form-control" rows="3" v-model="todoItem.desc"></textarea>
        </div>
        <div class="form-group mb-3">
        <label class="form-label">목표일</label>
        <input type="date" class="form-control" v-model="todoItem.targetDate" />
      </div>
        <div class="form-group d-flex gap-2">
          <button type="button" class="btn btn-primary" @click="addTodoHandler">추가</button>
          <!-- named 라우터 방식 -->
          <button type="button" class="btn btn-outline-secondary" @click="router.push({ name: 'todos' })">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoListStore } from '@/stores/todoList.js'

const router = useRouter()
const { addTodo } = useTodoListStore()
const todoItem = reactive({ todo: '', desc: '', targetDate: '' })

const addTodoHandler = () => {
  if (!todoItem.todo || todoItem.todo.trim() === '') {
    alert('할일은 반드시 입력해야 합니다.')
    return
  }
  addTodo(todoItem, () => {
    router.push({ name: 'todos' })
  })
}
</script>
