<template>
  <header style="padding: 20px; border-bottom: 1px solid #ccc">
    <h1>KB 가계부 스켈레톤</h1>
    <nav>
      <router-link to="/">대시보드</router-link> |
      <router-link to="/trans">거래내역</router-link> |
      <router-link to="/budget">예산관리</router-link> |
      <router-link to="/wishlist">위시리스트</router-link> |
      <router-link to="/users/login">로그인</router-link>
    </nav>
  </header>

  <main style="padding: 20px">
    <router-view></router-view>
  </main>
</template>

<style>
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #666;
}
.router-link-active {
  color: #ffcc00; /* KB 브랜드 포인트 컬러 */
  font-weight: bold;
}
</style>
