<script setup>
import { ref } from "vue";
import axios from "axios";

// 1. 모달 제어 상태
const isModalOpen = ref(false);
const modalType = ref("income"); // 'income' 또는 'expense'

// 2. 입력 데이터 바인딩 (v-model)
const formData = ref({
  date: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
  category: "",
  amount: 0,
  memo: "",
  type: "",
});

// 모달 열기 함수
const openModal = (type) => {
  modalType.value = type;
  formData.value = {
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: 0,
    memo: "",
    type: type,
  };
  isModalOpen.value = true;
};

// 3. 서버에 데이터 전송 (API 명세서 POST /transactions 반영)
const submitData = async () => {
  if (!formData.value.category || formData.value.amount <= 0) {
    alert("카테고리와 금액을 정확히 입력해주세요.");
    return;
  }

  try {
    await axios.post("http://localhost:3000/transactions", formData.value);
    alert("정상적으로 등록되었습니다.");
    isModalOpen.value = false;

    // 페이지 새로고침하여 대시보드 데이터 갱신
    window.location.reload();
  } catch (error) {
    console.error("데이터 등록 실패:", error);
    alert("등록 중 오류가 발생했습니다.");
  }
};
</script>

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
      <button class="kb-btn kb-logout">🔓 로그아웃</button>
    </div>

    <div
      v-if="isModalOpen"
      class="modal-overlay"
      @click.self="isModalOpen = false"
    >
      <div class="modal-content">
        <h3 :class="modalType">
          {{ modalType === "income" ? "수입" : "지출" }} 내역 추가
        </h3>
        <div class="form-container">
          <div class="form-item">
            <label>날짜</label>
            <input type="date" v-model="formData.date" />
          </div>
          <div class="form-item">
            <label>카테고리</label>
            <input
              type="text"
              v-model="formData.category"
              placeholder="식비, 월급 등"
            />
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
              placeholder="상세 내용을 적어주세요"
            />
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

<style scoped>
/* 사이드바 기본 스타일 (사용자 시안 반영) */
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
  transition: width 0.3s;
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
  transition: 0.2s;
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

/* 모달 스타일 (CSS 이론: 레이어 배치) */
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
.form-item input {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 10px;
  outline: none;
}
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
  cursor: pointer;
  font-weight: bold;
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

/* 텍스트 컬러 강조 */
.income {
  color: #2962ff;
}
.expense {
  color: #d50000;
}

/* 웹 반응형 */
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
