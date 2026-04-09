import { createRouter, createWebHistory } from "vue-router";

import Login from "../pages/auth/Login.vue";
import My from "../pages/auth/My.vue";
import Signup from "../pages/auth/Signup.vue";
import Budget from "../pages/budget/Budget.vue";
import Dashboard from "../pages/dashboard/Dashboard.vue";
import Transaction from "../pages/transaction/Transaction.vue";
import TransDetail from "../pages/transaction/TransDetail.vue";
import Wishlist from "../pages/Wishlist/Wishlist.vue";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/trans",
    name: "trans",
    component: Transaction,
  },
  {
    path: "/trans/:id",
    name: "trans/id",
    component: TransDetail,
  },
  {
    path: "/budget",
    name: "budget",
    component: Budget,
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: Wishlist,
  },
  {
    path: "/users/signup",
    name: "users/signup",
    component: Signup,
  },
  {
    path: "/users/login",
    name: "users/login",
    component: Login,
  },
  {
    path: "/users/my/:id",
    name: "users/my",
    component: My,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;