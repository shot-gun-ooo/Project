<template>
  <aside class="kb-sidebar">
    <div class="logo-area">
      <span class="logo-text">KB 가계부</span>
    </div>

    <nav class="kb-nav">
      <router-link to="/" class="kb-nav-item">
        <span class="icon">🏠</span> <span class="txt">홈</span>
      </router-link>
      <router-link to="/trans" class="kb-nav-item">
        <span class="icon">🔍</span> <span class="txt">전체 내역 조회</span>
      </router-link>
      <router-link to="/wishlist" class="kb-nav-item">
        <span class="icon">📡</span> <span class="txt">위시리스트</span>
      </router-link>
      <router-link to="/budget" class="kb-nav-item">
        <span class="icon">⚖️</span> <span class="txt">예산 관리</span>
      </router-link>
    </nav>

    <div class="kb-actions">
      <button @click="openModal('income')" class="kb-btn kb-income">
        ➕ 수입 추가
      </button>
      <button @click="openModal('expense')" class="kb-btn kb-expense">
        ➖ 지출 추가
      </button>
    </div>

    <!-- 수입/지출 입력 모달 -->
    <div
      v-if="isModalOpen"
      class="modal-overlay"
      @click.self="isModalOpen = false">
      <div class="modal-content">
        <h3 :class="modalType">
          {{ modalType === 'income' ? '수입' : '지출' }} 내역 추가
        </h3>
        <div class="form-container">
          <div class="form-item">
            <label>날짜</label>
            <input type="date" v-model="formData.date" />
          </div>

          <div class="form-item">
            <label>카테고리</label>
            <!-- 사용자가 요청한 드롭다운 방식 적용 -->
            <select v-model="formData.category" class="kb-select">
              <option value="">분류 선택</option>

              <optgroup v-if="modalType === 'income'" label="수입">
                <option
                  v-for="name in incomeCategories"
                  :key="`income-${name}`"
                  :value="name">
                  {{ name }}
                </option>
              </optgroup>

              <optgroup v-if="modalType === 'expense'" label="지출">
                <option
                  v-for="name in expenseCategories"
                  :key="`expense-${name}`"
                  :value="name">
                  {{ name }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="form-item">
            <label>금액 (원)</label>
            <input type="number" v-model="formData.amount" placeholder="0" />
          </div>
          <div class="form-item">
            <label>메모</label>
            <input
              type="text"
              v-model="formData.memo"
              placeholder="상세 내용을 적어주세요" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="submitData" class="btn-save">저장</button>
          <button @click="isModalOpen = false" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { getUserInfo } from '../../utils/authutil';

const isLoggedIn = ref(false);

// 카테고리 목록 저장
const incomeCategories = ref([]);
const expenseCategories = ref([]);

// 모달 및 폼 데이터 상태
const isModalOpen = ref(false);
const modalType = ref('income');
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  category: '',
  amount: 0,
  memo: '',
  type: '',
});

// 카테고리 데이터 가져오기
const fetchCategories = async () => {
  try {
    const [resIncome, resExpense] = await Promise.all([
      axios.get('/api/incomeCategory'),
      axios.get('/api/expenseCategory'),
    ]);
    incomeCategories.value = resIncome.data;
    expenseCategories.value = resExpense.data;
  } catch (error) {
    console.error('카테고리 로드 실패:', error);
  }
};

const checkLoginStatus = () => {
  const userInfo = getUserInfo();
  isLoggedIn.value = userInfo.authenticated;
};

onMounted(() => {
  checkLoginStatus();
  fetchCategories(); // 카테고리 로드 실행
});

const openModal = (type) => {
  modalType.value = type;
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: 0,
    memo: '',
    type: type, // income 또는 expense
  };
  isModalOpen.value = true;
};

const submitData = async () => {
  const { category, amount, date } = formData.value;

  // 1. 필수 입력 항목 검사 (Validation)
  if (!category || category.trim() === "") {
    alert("분류를 선택해주세요. 카테고리는 필수 항목입니다.");
    return;
  }

  // 2. 금액 유효성 및 음수 처리 (Exception Handling)
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    alert("금액은 0원보다 큰 숫자로 입력해주세요. (음수 입력 불가)");
    return;
  }

  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.id) {
    alert('로그인 정보가 없습니다.');
    return;
  }

  try {
    const postData = {
      ...formData.value,
      amount: numericAmount, // 확실하게 숫자 타입으로 저장
      userid: String(userInfo.id),
    };

    await axios.post('/api/transactions', postData);
    alert('정상적으로 등록되었습니다.');
    isModalOpen.value = false;
    window.location.reload();
  } catch (error) {
    console.error('데이터 등록 실패:', error);
    alert('등록 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 및 select 스타일 추가 */
.kb-sidebar {
  width: 260px;
  height: 100vh;
  background: #ffffff;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid #eee;
  z-index: 1000;
}
.logo-area {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #333;
}
.kb-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kb-nav-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  text-decoration: none;
  color: #666;
  border-radius: 12px;
}
.kb-nav-item.router-link-active {
  background: #e3f2fd;
  color: #2962ff;
  font-weight: bold;
}
.icon {
  margin-right: 14px;
  font-size: 18px;
}

.kb-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}
.kb-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}
.kb-income {
  background: #e3f2fd;
  color: #2962ff;
}
.kb-expense {
  background: #ffebee;
  color: #d50000;
}
.kb-logout {
  background: #fff;
  border: 1px solid #ccc;
  margin-top: 5px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-item label {
  font-size: 13px;
  color: #888;
}
.form-item input,
.kb-select {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 10px;
  outline: none;
  background: white;
}
.kb-select:focus,
.form-item input:focus {
  border-color: #2962ff;
}

.modal-footer {
  display: flex;
  gap: 10px;
}
.btn-save {
  flex: 2;
  background: #2962ff;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}
.btn-cancel {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
}

.income {
  color: #2962ff;
}
.expense {
  color: #d50000;
}

@media (max-width: 1100px) {
  .kb-sidebar {
    width: 85px;
    padding: 20px 10px;
  }
  .logo-text,
  .txt,
  .kb-btn {
    display: none;
  }
  .kb-nav-item {
    justify-content: center;
  }
}
</style>
