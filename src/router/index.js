import { createRouter, createWebHistory } from 'vue-router';
import { isMatchToRoles } from '../utils/authutil';

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
    },
    {
      path: '/trans',
      name: 'trans',
      component: Transaction,
    },
    {
      path: '/budget',
      name: 'budget',
      component: Budget,
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: Wishlist,
    },
    {
      path: '/users/signup',
      name: 'users/signup',
      component: Signup,
    },
    {
      path: '/users/login',
      name: 'users/login',
      component: Login,
    },
    {
      path: '/users/my/:id',
      name: 'users/my',
      component: My,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
    },
  ],
});

// 전역 네비게이션 가드
// 모든 페이지 이동 전에 권한 체크
router.beforeEach((to) => {
  if (!isMatchToRoles(to.name)) {
    return {
      name: 'users/login',
      query: { fromname: to.name },
    };
  }
});

export default router;
