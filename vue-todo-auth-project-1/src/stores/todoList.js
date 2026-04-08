import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import axios from 'axios'
import { getUserInfo } from '@/utils/authUtil.js'

export const useTodoListStore = defineStore('todoList', () => {
  const BASEURI = '/api/todos'
  const state = reactive({ todoList: [], isLoading: false })

  // Todo 목록 조회
  const fetchTodoList = async () => {
    try {
      state.isLoading = true
      const userInfo = getUserInfo()
      const response = await axios.get(BASEURI, {
        params: { userId: userInfo.id }
      })
      state.todoList = response.data
    } catch (error) {
      alert('에러 발생: ' + error)
    } finally {
      state.isLoading = false
    }
  }

  // Todo 추가
  const addTodo = async ({ todo, desc, targetDate }, successCallback) => {
    try {
      const userInfo = getUserInfo()
      const payload = {
        userId: userInfo.id,
        todo,
        desc,
        done: false,
        targetDate: targetDate || null,
        completedDate: null
      }
      await axios.post(BASEURI, payload)
      successCallback()
    } catch (error) {
      alert('에러 발생: ' + error)
    }
  }

  // Todo 수정
  const updateTodo = async ({ id, userId, todo, desc, done, targetDate, completedDate }, successCallback) => {
    try {
      const payload = { id, userId, todo, desc, done, targetDate, completedDate }
      await axios.put(`${BASEURI}/${id}`, payload)
      successCallback()
    } catch (error) {
      alert('에러 발생: ' + error)
    }
  }

  // Todo 삭제
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${BASEURI}/${id}`)
      await fetchTodoList()
    } catch (error) {
      alert('에러 발생: ' + error)
    }
  }

  // 완료 여부 토글
  const toggleDone = async (id) => {
    try {
      const todo = state.todoList.find((t) => t.id === id)
      const nextDone = !todo.done
      const payload = {
        ...todo,
        done: nextDone,
        completedDate: nextDone ? new Date().toISOString().slice(0, 10) : null
      }
      await axios.put(`${BASEURI}/${id}`, payload)
      await fetchTodoList()
    } catch (error) {
      alert('에러 발생: ' + error)
    }
  }

  const todoList = computed(() => state.todoList)
  const isLoading = computed(() => state.isLoading)
  const doneCount = computed(() => state.todoList.filter((t) => t.done === true).length)
  const totalCount = computed(() => state.todoList.length)

  return {
    todoList, isLoading, doneCount, totalCount,
    fetchTodoList, addTodo, deleteTodo, updateTodo, toggleDone,
  }
})