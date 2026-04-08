import { createRouter, createWebHistory } from 'vue-router'
import { isMatchToRoles } from '@/utils/authUtil.js'

import Login from '@/pages/user/Login.vue'
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import MyPage from '@/pages/user/MyPage.vue'
import TodoList from '@/pages/todo/TodoList.vue'
import AddTodo from '@/pages/todo/AddTodo.vue'
import EditTodo from '@/pages/todo/EditTodo.vue'
import NotFound from '@/pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'login', component: Login },
    { path: '/home', name: 'home', component: Home },
    { path: '/about', name: 'about', component: About },
    { path: '/mypage', name: 'mypage', component: MyPage },
    { path: '/todos', name: 'todos', component: TodoList },
    { path: '/todos/add', name: 'todos/add', component: AddTodo },
    { path: '/todos/edit/:id', name: 'todos/edit', component: EditTodo },
    { path: '/:paths(.*)*', name: 'notfound', component: NotFound },
  ]
})

// 전역 네비게이션 가드
// 모든 페이지 이동 전에 권한 체크
router.beforeEach((to) => {
  if (!isMatchToRoles(to.name)) {
    return {
      name: 'login',
      query: { fromname: to.name }
    }
  }
})

export default router
