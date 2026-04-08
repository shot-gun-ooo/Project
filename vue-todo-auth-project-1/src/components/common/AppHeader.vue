<template>
  <div class="app-header">
    <div class="profile-box">

      <!-- 프로필 동그라미 클릭 → 마이페이지 이동 -->
      <div class="profile-info" style="cursor: pointer;" @click="router.push({ name: 'mypage' })">

        <div class="avatar">
          <!-- 프로필 이미지가 있으면 표시, 없으면 기본 아이콘 -->
          <img v-if="userStore.profileImagePath" :src="userStore.profileImagePath" alt="프로필 사진"
            class="profile-img-circle" />
          <i v-else class="fa-solid fa-circle-user"></i>
        </div>

        <div>
          <div class="small">안녕하세요</div>
          <div class="fw-bold">{{ userInfo.userid }} 님</div>
        </div>
      </div>

      <button class="btn btn-light btn-sm rounded-circle">
        <i class="fa-solid fa-bell"></i>
      </button>
    </div>
    <div class="mt-4">
      <div class="small opacity-75">이번 달 학습 현황</div>

      <!-- 🔥 실시간 완료 현황 -->
      <h3 class="fw-bold mb-0">
        {{ todoStore.doneCount }} / {{ todoStore.totalCount }} 완료
      </h3>
    </div>
  </div>
</template>

<script setup>
// onMounted: 컴포넌트가 화면에 그려진 직후 실행
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/utils/authUtil.js'
import { useUserStore } from '@/stores/userStore.js'
import { useTodoListStore } from '@/stores/todoList'

const todoStore = useTodoListStore()
const router = useRouter()
const userInfo = getUserInfo()
const userStore = useUserStore()

// 컴포넌트 마운트 시 최신 프로필 이미지 경로 불러오기
onMounted(() => {
  userStore.loadProfileImage()
  todoStore.fetchTodoList()
})
</script>

<style scoped>
.profile-img-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
</style>
