<template>
  <div class="login-wrap d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow p-4 w-100" style="max-width: 360px;">

      <h2 class="fw-bold text-center mb-4">로그인</h2>

      <div class="mb-3">
        <label class="form-label">아이디</label>
        <input type="text" class="form-control" placeholder="아이디를 입력하세요" v-model="info.userid" />
      </div>

      <div class="mb-4">
        <label class="form-label">비밀번호</label>
        <input type="password" class="form-control" placeholder="비밀번호를 입력하세요" v-model="info.password" />
      </div>

      <button class="btn btn-primary w-100" @click="login">로그인</button>

      <div class="mt-3 text-center text-secondary small">
        테스트 계정: user1 / 1234 &nbsp;|&nbsp; admin / 1234
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginProcess } from '@/utils/authUtil.js'

const router = useRouter()
const currentRoute = useRoute()
const fromname = currentRoute.query.fromname

const info = reactive({ userid: '', password: '' })

const successCallback = () => {
  // 로그인 전 가려던 페이지가 있으면 그쪽으로, 없으면 홈으로
  router.replace({ name: fromname || 'home' })
}

const failCallback = () => {
  alert('아이디 또는 비밀번호가 올바르지 않습니다.')
}

const login = () => {
  loginProcess(info.userid, info.password, successCallback, failCallback)
}
</script>
