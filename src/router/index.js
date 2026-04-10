import { createRouter, createWebHistory } from 'vue-router';
import { getUserInfo } from '@/utils/authUtil.js';

import Login from '../pages/auth/Login.vue';
import My from '../pages/auth/My.vue';
import Signup from '../pages/auth/Signup.vue';
import Budget from '../pages/budget/Budget.vue';
import Dashboard from '../pages/dashboard/Dashboard.vue';
import Transaction from '../pages/transaction/Transaction.vue';
import Wishlist from '../pages/Wishlist/Wishlist.vue';
import Admin from '../pages/auth/Admin.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { roles: ['users', 'admins'] },
    },
    {
      path: '/trans',
      name: 'trans',
      component: Transaction,
      meta: { roles: ['users', 'admins'] },
    },
    {
      path: '/budget',
      name: 'budget',
      component: Budget,
      meta: { roles: ['users', 'admins'] },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: Wishlist,
      meta: { roles: ['users', 'admins'] },
    },
    {
      path: '/users/signup',
      name: 'users/signup',
      component: Signup,
      meta: { allowAnonymous: true },
    },
    {
      path: '/users/login',
      name: 'users/login',
      component: Login,
      meta: { allowAnonymous: true },
    },
    {
      path: '/users/my/:id',
      name: 'users/my',
      component: My,
      meta: { roles: ['users'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { roles: ['admins'] },
    },
  ],
});

// 전역 네비게이션 가드
router.beforeEach((to) => {
  const userInfo = getUserInfo();

  // 누구나 접근 가능한 페이지는 통과
  if (to.meta.allowAnonymous) {
    return true;
  }

  // 로그인 안 된 경우 → 로그인 페이지
  if (!userInfo.authenticated) {
    return {
      name: 'users/login',
      query: { fromname: to.fullPath },
    };
  }

  // roles가 없으면 통과
  const allowedRoles = to.meta.roles || [];
  if (allowedRoles.length === 0) {
    return true;
  }

  return true;
});

export default router;
