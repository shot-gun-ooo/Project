<template>
  <div class="admin-container">
    <div class="category-card">
      <h2 class="category-title">카테고리 목록</h2>

      <div class="category-tabs">
        <button
          :class="['tab-btn', { active: currentTab === 'income' }]"
          @click="currentTab = 'income'">
          수입
        </button>
        <button
          :class="['tab-btn', { active: currentTab === 'expense' }]"
          @click="currentTab = 'expense'">
          지출
        </button>
      </div>

      <div v-if="currentTab === 'income'" class="tab-content">
        <div class="add-section">
          <div class="input-row">
            <input
              :value="incomeCategoryName"
              @keyup.enter="isIncomeNameValid && addIncomeCategories()"
              @input="incomeCategoryName = $event.target.value"
              class="add-input" />
            <button
              :disabled="!isIncomeNameValid"
              class="add-btn"
              @click="addIncomeCategories">
              + 추가
            </button>
          </div>

          <p v-if="isIncomeDuplicate" class="error-text">
            이미 존재하는 카테고리 이름입니다.
          </p>
        </div>

        <ul class="category-list">
          <li
            v-for="item in incomeCategory"
            :key="item.id"
            class="category-item">
            <span class="item-name">{{ item.name }}</span>
            <div class="item-actions">
              <button @click="deleteIncomeCategory(item.id)" class="delete-btn">
                삭제
              </button>
              <button @click="editIncome(item)" class="action-btn">수정</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="currentTab === 'expense'" class="tab-content">
        <div class="add-section">
          <div class="input-row">
            <input
              :value="expenseCategoryName"
              @keyup.enter="isExpenseNameValid && addExpenseCategories()"
              @input="expenseCategoryName = $event.target.value"
              class="add-input" />
            <button
              :disabled="!isExpenseNameValid"
              class="add-btn"
              @click="addExpenseCategories">
              + 추가
            </button>
          </div>
          <p v-if="isExpenseDuplicate" class="error-text">
            이미 존재하는 카테고리 이름입니다.
          </p>
        </div>

        <ul class="category-list">
          <li
            v-for="item in expenseCategory"
            :key="item.id"
            class="category-item">
            <span class="item-name">{{ item.name }}</span>
            <div class="item-actions">
              <button
                @click="deleteExpenseCategory(item.id)"
                class="delete-btn">
                삭제
              </button>
              <button @click="editExpense(item)" class="action-btn">
                수정
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';

const currentTab = ref('income');

const incomeCategory = ref([]);
const expenseCategory = ref([]);

const incomeCategoryName = ref(''); // 카테고리 이름 입력할 때 이용
const expenseCategoryName = ref('');

// 1. 수입 / 지출 카테고리 조회
const fetchIncomeCategories = async () => {
  try {
    const response = await axios.get('/api/incomeCategory');
    incomeCategory.value = response.data;
  } catch (error) {
    alert(error.message);
  }
};

const fetchExpenseCategories = async () => {
  try {
    const response = await axios.get('/api/expenseCategory');
    expenseCategory.value = response.data;
  } catch (error) {
    alert(error.message);
  }
};

onMounted(() => {
  fetchIncomeCategories();
  fetchExpenseCategories();
});

// 2. 수입 / 지출 카테고리 추가
const addIncomeCategories = async () => {
  try {
    await axios.post('/api/incomeCategory', {
      name: incomeCategoryName.value,
    });
    alert('카테고리가 추가되었습니다!');
    await fetchIncomeCategories();
    incomeCategoryName.value = '';
  } catch (error) {
    alert('추가 실패: ' + error.message);
  }
};

const addExpenseCategories = async () => {
  try {
    await axios.post('/api/expenseCategory', {
      name: expenseCategoryName.value,
    });
    alert('카테고리가 추가되었습니다!');
    await fetchExpenseCategories();
    expenseCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};

// 3. 수입 / 지출 카테고리 수정
const updateIncomeCategories = async (id, newName) => {
  try {
    const response = await axios.put(`/api/incomeCategory/${id}`, {
      name: newName,
    });
    fetchIncomeCategories();
    incomeCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};

const updateExpenseCategories = async (id, newName) => {
  try {
    const response = await axios.put(`/api/expenseCategory/${id}`, {
      name: newName,
    });
    fetchExpenseCategories();
    expenseCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};
// 수입 카테고리 수정
const editIncome = (item) => {
  const n = window.prompt('새 이름을 입력하세요', item.name);
  if (n && n.trim() !== '') {
    updateIncomeCategories(item.id, n);
  }
};

// 지출 카테고리 수정
const editExpense = (item) => {
  const n = window.prompt('새 이름을 입력하세요', item.name);
  if (n && n.trim() !== '') {
    updateExpenseCategories(item.id, n);
  }
};

// 4. 수입 / 지출 카테고리 삭제
const deleteIncomeCategory = async (id) => {
  try {
    await axios.delete(`/api/incomeCategory/${id}`);
    fetchIncomeCategories();
  } catch (error) {
    alert(error.message);
  }
};

const deleteExpenseCategory = async (id) => {
  try {
    await axios.delete(`/api/expenseCategory/${id}`);
    fetchExpenseCategories();
  } catch (error) {
    alert(error.message);
  }
};

// 카테고리 이름 길이 확인
const isIncomeLengthValid = computed(() => {
  return incomeCategoryName.value.trim().length >= 2;
});

const isExpenseLengthValid = computed(() => {
  return expenseCategoryName.value.trim().length >= 2;
});

// 카테고리 이름 중복 확인
const isIncomeDuplicate = computed(() => {
  const name = incomeCategoryName.value.trim();
  if (!name) return false;
  return incomeCategory.value.some((item) => item.name === name);
});

const isExpenseDuplicate = computed(() => {
  const name = expenseCategoryName.value.trim();
  if (!name) return false;
  return expenseCategory.value.some((item) => item.name === name);
});

// 카테고리 이름 유효성 확인
const isIncomeNameValid = computed(() => {
  return isIncomeLengthValid.value && !isIncomeDuplicate.value;
});

const isExpenseNameValid = computed(() => {
  return isExpenseLengthValid.value && !isExpenseDuplicate.value;
});
</script>

<style scoped>
.admin-container {
  padding: 40px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.category-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.category-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 탭 스타일 */
.category-tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  color: #888;
  cursor: pointer;
  font-weight: 500;
  position: relative;
}

.tab-btn.active {
  color: #333;
  font-weight: bold;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #333;
}

/* 추가 섹션 레이아웃 */
.add-section {
  display: flex;
  flex-direction: column; /* 수직으로 쌓기 (인풋라인 + 에러메시지) */
  gap: 6px;
  margin-bottom: 24px;
}

.input-row {
  display: flex; /* 인풋과 버튼을 한 줄에 */
  gap: 8px;
  align-items: flex-start; /* 에러 메시지 높이 변화에도 상단 고정 */
}

/* ⭐ 인풋과 버튼 높이 맞춤 핵심 ⭐ */
.add-input,
.add-btn {
  transition: all 0.1s ease;
  height: 42px; /* 높이 통일 */
  box-sizing: border-box; /* 패딩/테두리 포함 계산 */
}

.add-input {
  flex: 1;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.add-input:focus {
  border-color: #85c1e9;
}

.add-btn {
  background-color: #85c1e9;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; /* 버튼 글자 줄바꿈 방지 */
}

.add-btn:hover {
  background-color: #5dade2;
}

/* 비활성화 상태 스타일 (선택사항) */
.add-btn:disabled {
  background-color: #d5dbdb;
  cursor: not-allowed;
}

/* 카테고리 리스트 */
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.item-name {
  font-size: 15px;
  color: #444;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background-color: #aed6f1;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #85c1e9;
}

/* 에러 메시지 */
.error-text {
  color: #e74c3c;
  font-size: 11px;
  margin: 0;
  padding-left: 4px;
}

.delete-btn {
  background-color: #fadbd8; /* 연한 빨간색 배경 */
  color: #e74c3c; /* 진한 빨간색 글자 */
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
</style>
