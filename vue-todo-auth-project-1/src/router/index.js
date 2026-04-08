import { createRouter, createWebHistory } from 'vue-router'
import { getUserInfo } from '@/utils/authUtil.js'

import Login from '@/pages/user/Login.vue'
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import MyPage from '@/pages/user/MyPage.vue'
import TodoList from '@/pages/todo/TodoList.vue'
import AddTodo from '@/pages/todo/AddTodo.vue'
import EditTodo from '@/pages/todo/EditTodo.vue'
import NotFound from '@/pages/NotFound.vue'
import UserManage from '@/pages/admin/UserManage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: { allowAnonymous: true } // 누구나 접근 가능
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { roles: ['users', 'admins'] }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { roles: ['users'] }
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPage,
      meta: { roles: ['users', 'admins'] }
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodoList,
      meta: { roles: ['users', 'admins'] }
    },
    {
      path: '/todos/add',
      name: 'todos/add',
      component: AddTodo,
      meta: { roles: ['users', 'admins'] }
    },
    {
      path: '/todos/edit/:id',
      name: 'todos/edit',
      component: EditTodo,
      meta: { roles: ['users', 'admins'] }
    },
    {
      path: '/admin/users',
      name: 'admin/users',
      component: UserManage,
      meta: { roles: ['admins'] }
    },
    {
      path: '/:paths(.*)*',
      name: 'notfound',
      component: NotFound,
      meta: { allowAnonymous: true } // 404는 누구나 접근 가능
    },
  ]
})

// 전역 네비게이션 가드
router.beforeEach((to) => {
  const userInfo = getUserInfo()

  // 누구나 접근 가능한 페이지는 통과
  if (to.meta.allowAnonymous) {
    return true
  }

  // 로그인 안 된 경우 → 로그인 페이지
  if (!userInfo.authenticated) {
    return {
      name: 'login',
      query: { fromname: to.fullPath }
    }
  }

  // roles가 없으면 통과
  const allowedRoles = to.meta.roles || []
  if (allowedRoles.length === 0) {
    return true
  }

  // 로그인은 했지만 권한이 없는 경우
  const hasRole = userInfo.roles?.some((role) => allowedRoles.includes(role))
  if (!hasRole) {
    return { name: 'notfound' }
  }

  return true
})

export default router