import { createRouter, createWebHistory } from "vue-router";

// 이미지의 폴더 구조에 맞춘 임포트 경로
import Login from "../pages/auth/Login.vue";
import My from "../pages/auth/My.vue"; // 이미지상 auth 폴더 안에 있음
import Signup from "../pages/auth/Signup.vue";
import Budget from "../pages/budget/Budget.vue";
import Dashboard from "../pages/dashboard/Dashboard.vue";
import Transaction from "../pages/transaction/Transaction.vue";
import TransDetail from "../pages/transaction/TransDetail.vue";
import Wishlist from "../pages/Wishlist/Wishlist.vue"; // 이미지상 대문자 Wishlist 폴더

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/trans",
    name: "Transaction",
    component: Transaction,
  },
  {
    path: "/trans/:id",
    name: "TransDetail",
    component: TransDetail,
  },
  {
    path: "/budget",
    name: "Budget",
    component: Budget,
  },
  {
    path: "/wishlist",
    name: "Wishlist",
    component: Wishlist,
  },
  {
    path: "/users/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/users/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/users/my/:id",
    name: "My",
    component: My,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
