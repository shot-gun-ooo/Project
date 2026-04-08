<template>
  <div class="container py-4 quick-menu">
    <h5 class="fw-bold mb-3">빠른 메뉴</h5>
    <div class="row g-3">
      <div class="col-6" v-for="item in filteredMenus" :key="item.title">
        <div class="card shadow-sm p-3 h-100" style="cursor: pointer;"
          @click="item.routeName ? router.push({ name: item.routeName }) : null">
          <div class="menu-icon" :class="item.iconBoxClass">
            <i :class="item.icon"></i>
          </div>
          <h6 class="mb-1">{{ item.title }}</h6>
          <p class="text-secondary small mb-0">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/utils/authUtil.js'
import { homeMenus } from '@/config/menus.js'

const router = useRouter()
const userInfo = getUserInfo()

// roles가 없으면 모두 표시
// roles가 있으면 현재 로그인 사용자의 roles와 비교해서 표시
const filteredMenus = computed(() => {
  // // item을 하나씩 꺼내서 true면 결과에 포함, false면 제외
  return homeMenus.filter((item) => {
    //roles가 없으면 (null, undefined) 무조건 포함
    if (!item.roles) return true

    // 사용자 roles 중 item.roles에 하나라도 포함되면 true
    return userInfo.roles?.some((role) => item.roles.includes(role))
  })
})
</script>

<!-- export const homeMenus = [
  {
    title: '내 강의',
    desc: '수강 중인 강의 보기',
    icon: 'fa-solid fa-book',
    iconBoxClass: 'bg-primary-subtle text-primary',
    routeName: 'about',
    roles: ['users']
  },
  {
    title: '사용자 관리',
    desc: '회원 목록 및 권한 관리',
    icon: 'fa-solid fa-users',
    iconBoxClass: 'bg-primary-subtle text-primary',
    routeName: 'admin/users',
    roles: ['admins']
  },
  {
    title: '출석 체크',
    desc: '오늘 출석 확인하기',
    icon: 'fa-solid fa-calendar-check',
    iconBoxClass: 'bg-success-subtle text-success',
    routeName: null,
  },
  {
    title: '할일 목록',
    desc: '오늘 할일 확인하기',
    icon: 'fa-solid fa-clipboard-list',
    iconBoxClass: 'bg-warning-subtle text-warning',
    routeName: 'todos',
  },
  {
    title: '마이페이지',
    desc: '프로필 및 설정',
    icon: 'fa-solid fa-gear',
    iconBoxClass: 'bg-danger-subtle text-danger',
    routeName: 'mypage',
  },
] -->