<template>
  <MainLayout>
  <div class="mypage-wrap">

    <div class="app-header">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-light btn-sm rounded-circle" @click="router.back()">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <span class="fw-bold fs-5">마이페이지</span>
      </div>
    </div>

    <div class="container py-4">

      <!-- 프로필 사진 영역 -->
      <div class="text-center mb-4">
        <div style="position: relative; width: 100px; height: 100px; margin: 0 auto 12px;">

          <!-- 프로필 이미지 또는 기본 아이콘 -->
          <img v-if="userStore.profileImagePath" :src="userStore.profileImagePath" alt="프로필 사진"
            class="profile-img-large" />
          <i v-else class="fa-solid fa-circle-user" style="font-size: 100px; color: #ccc;"></i>

          <!-- 카메라 아이콘 클릭 → 파일 선택 창 열림 -->
          <!-- label의 for 속성이 input의 id와 연결됨 -->
          <label for="profileUpload" class="profile-edit-btn" title="프로필 사진 변경">
            <i class="fa-solid fa-camera"></i>
          </label>
        </div>

        <!-- 파일 input: 화면에 숨기고 label로 클릭 유도 -->
        <!-- accept="image/*" 로 이미지 파일만 선택 가능 -->
        <input id="profileUpload" type="file" accept="image/*" style="display: none;" @change="onImageChange" />

      </div>

      <!-- 저장 경로 안내 -->
      <!-- 실제 파일 저장 위치 안내 (개발 중 참고용) -->
      <div v-if="savedPath" class="alert alert-info small mb-3">
        저장된 경로: {{ savedPath }}<br />
        실제 파일은 <strong>public/uploads/profile/</strong> 폴더에 넣어야 표시됩니다.
      </div>

      <!-- 사용자 정보 -->
      <div class="card shadow-sm p-3 mb-3">
        <div class="d-flex justify-content-between">
          <span class="text-secondary small">아이디</span>
          <span class="fw-bold">{{ userInfo.userid }}</span>
        </div>
      </div>

      <div class="card shadow-sm p-3 mb-3">
        <div class="d-flex justify-content-between">
          <span class="text-secondary small">권한</span>
          <span class="fw-bold">{{ userInfo.roles?.join(', ') }}</span>
        </div>
      </div>
      <Bar v-if="loaded" :data="barData" :options="barOptions" />

      <button class="btn btn-outline-danger w-100 mt-3" @click="logout">
        <i class="fa-solid fa-right-from-bracket me-2"></i>
        로그아웃
      </button>
    </div>
  
   
  </div>
    </MainLayout>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo, logoutProcess } from '@/utils/authUtil.js'
import { useUserStore } from '@/stores/userStore.js'
import { useTodoListStore } from '@/stores/todoList.js' // Todo 스토어 추가
import BottomNav from '@/components/common/BottomNav.vue'
import { Bar } from 'vue-chartjs'
import MainLayout from '@/components/common/MainLayout.vue'


// npm install chart.js vue-chartjs
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale, // Y축 때문에 추가
  Tooltip,
  Legend,
  Title
} from 'chart.js'

// 차트 요소 등록
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
)

const router = useRouter()
const userInfo = getUserInfo()
const userStore = useUserStore()
const todoStore = useTodoListStore() // Todo 스토어 사용

// 저장된 경로 표시용
const savedPath = ref(null)

// 차트 렌더링 여부
const loaded = ref(false)

// Bar 차트 데이터
const barData = ref(null)

// Bar 차트 옵션
const barOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: '할일 목표 달성 현황'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

// 마이페이지 진입 시
onMounted(async () => {
  // 프로필 이미지 로드
  await userStore.loadProfileImage()

  // Todo 목록 로드
  await todoStore.fetchTodoList()

  // 차트 데이터 생성
  loadChart()
})

// 차트 데이터 생성 함수
const loadChart = () => {

  // 목표 달성:
  // 완료(done=true) && completedDate 존재 && completedDate <= targetDate
  const achieved = todoStore.todoList.filter((t) => {
    return t.done && t.completedDate && t.targetDate && t.completedDate <= t.targetDate
  }).length

  // 목표 미달:
  // 1) 아직 미완료
  // 2) 완료했지만 목표일 초과
  const missed = todoStore.todoList.filter((t) => {
    if (!t.targetDate) return false
    if (!t.done) return true
    if (!t.completedDate) return true
    return t.completedDate > t.targetDate
  }).length

  barData.value = {
    labels: ['나의 할일'],
    datasets: [
      {
        label: '목표 달성',
        data: [achieved],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      },
      {
        label: '목표 미달',
        data: [missed],
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  }

  loaded.value = true
}

// 파일 선택 시 실행
const onImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.')
    return
  }

  const path = await userStore.uploadProfileImage(file)
  savedPath.value = path
}

const logout = () => {
  logoutProcess(() => {
    router.replace({ name: 'login' })
  })
}
</script>

<style scoped>
.profile-img-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.profile-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #0d6efd;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
}
</style>
