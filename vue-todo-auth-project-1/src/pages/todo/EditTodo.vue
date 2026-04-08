<template>
  <div class="container py-3">
    <div class="row">
      <div class="col p-3 d-flex align-items-center gap-2">
        <button class="btn btn-light btn-sm rounded-circle" @click="router.back()">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h5 class="fw-bold mb-0">할일 수정</h5>
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

        <!-- 목표일 추가 -->
        <div class="form-group mb-3">
          <label class="form-label">목표일</label>
          <input type="date" class="form-control" v-model="todoItem.targetDate" />
        </div>

        <div class="form-group mb-3">
          <label class="form-label">완료 여부</label>
          <div>
            <input type="checkbox" class="form-check-input me-2" v-model="todoItem.done" />
            <span>{{ todoItem.done ? '완료' : '미완료' }}</span>
          </div>
        </div>

        <!-- 완료일 표시 -->
        <div class="form-group mb-3">
          <label class="form-label">완료일</label>
          <input type="date" class="form-control" v-model="todoItem.completedDate" disabled />
        </div>

        <div class="form-group d-flex gap-2">
          <button type="button" class="btn btn-primary" @click="updateTodoHandler">수정</button>
          <button type="button" class="btn btn-outline-secondary" @click="router.push({ name: 'todos' })">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTodoListStore } from '@/stores/todoList.js'

const router = useRouter()
const currentRoute = useRoute()
const { todoList, updateTodo } = useTodoListStore()

// URL 파라미터 :id 로 해당 항목 찾기
const matchedTodoItem = todoList.find((item) => item.id === currentRoute.params.id)
if (!matchedTodoItem) {
  router.push({ name: 'todos' })
}

const todoItem = reactive({ ...matchedTodoItem })

// 완료 체크 변경 시 완료일 자동 처리
watch(
  () => todoItem.done,
  (newValue) => {
    if (newValue) {
      todoItem.completedDate = new Date().toISOString().slice(0, 10)
    } else {
      todoItem.completedDate = null
    }
  }
)

const updateTodoHandler = () => {
  if (!todoItem.todo || todoItem.todo.trim() === '') {
    alert('할일은 반드시 입력해야 합니다.')
    return
  }

  updateTodo({ ...todoItem }, () => {
    router.push({ name: 'todos' })
  })
}
</script>
