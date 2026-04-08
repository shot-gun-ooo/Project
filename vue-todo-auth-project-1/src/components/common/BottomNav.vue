<template>
  <div class="bottom-nav py-3">
    <div class="container">
      <div class="d-flex justify-content-around text-center">

        <!-- 각 탭 클릭 시 named 라우터로 이동 -->
        <a
          v-for="item in navItems"
          :key="item.label"
          href="#"
          :class="{ active: activeMenu === item.label }"
          @click.prevent="navigate(item)"
        >
          <i :class="item.icon + ' bottom-icon'"></i>
          <div>{{ item.label }}</div>
        </a>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeMenu = ref('홈')

const navItems = [
  { label: '홈',  icon: 'fa-solid fa-house',         routeName: 'home'   },
  { label: '강의', icon: 'fa-solid fa-book-open',     routeName: 'about'  },
  { label: '과제', icon: 'fa-solid fa-clipboard-list', routeName: 'todos'  },
  { label: '마이', icon: 'fa-solid fa-user',           routeName: 'mypage' },
]

const navigate = (item) => {
  activeMenu.value = item.label
  router.push({ name: item.routeName })
}
</script>
