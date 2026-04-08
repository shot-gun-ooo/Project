<template>
  <MainLayout>
    <div>
      <AppHeader />

      <div class="container py-3">
        <div class="row">
          <div class="col p-3 d-flex align-items-center gap-2">
            <button class="btn btn-light btn-sm rounded-circle" @click="router.back()">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h5 class="fw-bold mb-0">사용자 관리</h5>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <!-- 상단 버튼 -->
            <div class="card shadow-sm p-3 mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="small text-secondary">
                  전체 사용자 수: <strong>{{ users.length }}</strong>
                </div>

                <button
                  class="btn btn-outline-danger btn-sm"
                  :disabled="selectedIds.length === 0"
                  @click="deleteSelectedUsers"
                >
                  선택 삭제
                </button>
              </div>
            </div>

            <!-- 로딩 -->
            <div v-if="isLoading" class="text-center py-4 text-secondary">
              사용자 목록을 불러오는 중입니다...
            </div>

            <!-- 사용자 목록 -->
            <div v-else class="card shadow-sm">
              <div class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 50px;">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :checked="isAllSelected"
                          @change="toggleSelectAll"
                        />
                      </th>
                      <th>아이디</th>
                      <th>권한</th>
                      <th style="width: 120px;">관리</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :value="user.id"
                          v-model="selectedIds"
                        />
                      </td>

                      <td>{{ user.userid }}</td>
                      <td>{{ user.roles?.join(', ') }}</td>

                      <td>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          @click="deleteOneUser(user)"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>

                    <tr v-if="users.length === 0">
                      <td colspan="4" class="text-center text-secondary py-4">
                        등록된 사용자가 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AppHeader from '@/components/common/AppHeader.vue'
import MainLayout from '@/components/common/MainLayout.vue'

const router = useRouter()

const users = ref([])
const isLoading = ref(false)
const selectedIds = ref([])

// 사용자 목록 조회
const fetchUsers = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/users')
    users.value = response.data
  } catch (error) {
    alert('사용자 목록 조회 중 오류가 발생했습니다: ' + error)
  } finally {
    isLoading.value = false
  }
}

// 전체 선택 여부
const isAllSelected = computed(() => {
  if (users.value.length === 0) return false
  return users.value.every((user) => selectedIds.value.includes(user.id))
})

// 전체 선택 / 해제
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = users.value.map((user) => user.id)
  } else {
    selectedIds.value = []
  }
}

// 개별 삭제
const deleteOneUser = async (user) => {
  const ok = window.confirm(`${user.userid} 사용자를 삭제할까요?`)
  if (!ok) return

  try {
    await axios.delete(`/api/users/${user.id}`)
    users.value = users.value.filter((u) => u.id !== user.id)
    selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
  } catch (error) {
    alert('사용자 삭제 중 오류가 발생했습니다: ' + error)
  }
}

// 선택 삭제
const deleteSelectedUsers = async () => {
  if (selectedIds.value.length === 0) {
    alert('삭제할 사용자를 선택하세요.')
    return
  }

  const ok = window.confirm(`선택한 ${selectedIds.value.length}명의 사용자를 삭제할까요?`)
  if (!ok) return

  try {
    for (const id of selectedIds.value) {
      await axios.delete(`/api/users/${id}`)
    }

    users.value = users.value.filter((user) => !selectedIds.value.includes(user.id))
    selectedIds.value = []
  } catch (error) {
    alert('선택 삭제 중 오류가 발생했습니다: ' + error)
  }
}

onMounted(async () => {
  await fetchUsers()
})
</script>