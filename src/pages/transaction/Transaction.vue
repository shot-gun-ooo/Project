<template>
  <div class="transaction-page">
    <div class="page-top">
      <div>
        <p class="eyebrow">대시보드 앱</p>
        <h1>전체 내역 조회</h1>
      </div>

      <div class="date-range-box">
        <input type="date" v-model="range.start" />
        <span>~</span>
        <input type="date" v-model="range.end" />
      </div>
    </div>

    <div class="content-grid">
      <section class="card card-large">
        <div class="section-head">
          <button class="pill">거래 내역</button>
          <button
            class="line-btn disabled-look"
            @click="notReady('거래 내역 추가')">
            추가
          </button>
        </div>

        <div class="table-wrap tall">
          <table class="data-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>내용</th>
                <th>금액</th>
                <th>분류</th>
                <th>구분</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredTransactions" :key="String(item.id)">
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ item.memo }}</td>
                <td
                  :class="{
                    income: item.type === 'income',
                    expense: item.type !== 'income',
                  }">
                  {{ item.type === 'income' ? '+' : '-'
                  }}{{ formatCurrency(item.amount) }}
                </td>
                <td>
                  <span
                    class="type-badge"
                    :class="
                      item.type === 'income' ? 'income-badge' : 'expense-badge'
                    ">
                    {{ item.type === 'income' ? '수입' : '지출' }}
                  </span>
                </td>
                <td class="manage-cell">
                  <button
                    class="mini-btn disabled-look"
                    @click="notReady('거래 내역 수정')">
                    수정
                  </button>
                  <button
                    class="mini-btn danger disabled-look"
                    @click="notReady('거래 내역 삭제')">
                    삭제
                  </button>
                </td>
              </tr>

              <tr v-if="filteredTransactions.length === 0">
                <td colspan="6" class="empty">
                  조건에 맞는 거래 내역이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="side-column">
        <section class="card">
          <div class="section-head">
            <button class="pill">월 고정 지출</button>

            <div class="fixed-head-actions">
              <div class="total-box">
                
              </div>
              <button
                class="line-btn disabled-look"
                @click="notReady('월 고정 지출 저장')">
                저장
              </button>
            </div>
          </div>

          <div class="sub-action">
            <button
              class="line-btn disabled-look"
              @click="notReady('월 고정 지출 추가')">
              추가
            </button>
          </div>

          <div class="table-wrap short">
            <table class="data-table">
              <thead>
                <tr>
                  <th>내용</th>
                  <th>비용(-)</th>
                  <th>결제일 (매월)</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isAddingPeriodicExpense" class="edit-row">
                  <td>
                    <input
                      type="text"
                      v-model="newPeriodicExpense.memo"
                      placeholder="내용 입력"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      v-model.number="newPeriodicExpense.amount"
                      placeholder="비용"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      v-model.number="newPeriodicExpense.payDay"
                    />
                  </td>
                  <td class="manage-cell">
                    <button
                      class="mini-btn disabled-look"
                      @click="notReady('월 고정 지출 수정')">
                      수정
                    </button>
                    <button
                      class="mini-btn danger disabled-look"
                      @click="notReady('월 고정 지출 삭제')">
                      삭제
                    </button>
                  </td>
                </tr>

                <tr v-if="periodicExpenses.length === 0">
                  <td colspan="4" class="empty">
                    등록된 고정 지출이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <div class="section-head">
            <button class="pill">필터</button>
            <div class="filter-btns">
              <button class="line-btn primary-outline" @click="applyFilter">
                검색
              </button>
              <button class="line-btn" @click="resetFilter">초기화</button>
            </div>
          </div>

          <div class="filter-form">
            <div class="form-group">
              <label>내용</label>
              <input
                type="text"
                v-model="draftFilter.keyword"
                placeholder="검색어를 입력하세요" />
            </div>

            <div class="form-group">
              <label>날짜</label>
              <input type="date" v-model="draftFilter.date" />
            </div>

            <div class="form-group">
              <label>분류</label>
              <input
                type="text"
                v-model="draftFilter.category"
                placeholder="예) 식비" />
            </div>

            <div class="form-group">
              <label>가격</label>
              <input
                type="number"
                min="0"
                v-model.number="draftFilter.amount"
                placeholder="예) 10000" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import { getUserInfo } from '../../utils/authutil';

const API_BASE = 'http://localhost:3000';
const USER_ID = '1';

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const lastDayOfMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();

const range = reactive({
  start: `${currentYear}-${currentMonth}-01`,
  end: `${currentYear}-${currentMonth}-${String(lastDayOfMonth).padStart(2, '0')}`,
});

const transactions = ref([]);
const periodicExpenses = ref([]); 
const incomeCategories = ref([]);
const expenseCategories = ref([]);

const isAddingTransaction = ref(false);
const editingTransactionId = ref(null);
const selectedNewCategory = ref("");
const selectedEditCategory = ref("");

const newTransaction = reactive({
  date: range.start,
  memo: "",
  amount: null,
  category: "",
  type: "expense",
});

const editingTransaction = reactive({
  id: null,
  date: "",
  memo: "",
  amount: null,
  category: "",
  type: "expense",
});

/* 월 고정 지출 UI */
const isAddingPeriodicExpense = ref(false);
const editingPeriodicExpenseId = ref(null);

const newPeriodicExpense = reactive({
  memo: "",
  amount: null,
  payDay: 1,
});

const editingPeriodicExpense = reactive({
  id: null,
  memo: "",
  amount: null,
  payDay: 1,
});

const draftFilter = reactive({
  keyword: '',
  date: '',
  category: '',
  amount: null,
});

const activeFilter = reactive({
  keyword: '',
  date: '',
  category: '',
  amount: null,
});

const incomeCategorySet = computed(() => {
  return new Set(
    incomeCategories.value.map((item) =>
      String(item).trim().toLowerCase()
    )
  );
});

async function fetchTransactions() {
  try {
    const { data } = await axios.get(`${API_BASE}/transactions`, {
      params: { userid: USER_ID },
    });
    transactions.value = Array.isArray(data) ? data : [];
  } catch (error) {}
}

async function fetchPeriodicExpenses() {
  try {
    const { data } = await axios.get(`${API_BASE}/periodicExpense`, {
      params: { userid: USER_ID },
    });
    periodicExpenses.value = Array.isArray(data) ? data : [];
  } catch (error) {}
}

const filteredTransactions = computed(() => {
  return [...transactions.value]
    .filter((item) => isInRange(item.date))
    .filter((item) => {
      const keyword = activeFilter.keyword.trim().toLowerCase();
      const category = activeFilter.category.trim().toLowerCase();
      const itemMemo = String(item.memo || '').toLowerCase();
      const itemCategory = String(item.category || '').toLowerCase();
      const itemAmount = Number(item.amount || 0);

      const matchesKeyword = !keyword || itemMemo.includes(keyword);
      const matchesDate = !activeFilter.date || item.date === activeFilter.date;
      const matchesCategory = !category || itemCategory.includes(category);
      const matchesAmount =
        activeFilter.amount === null ||
        activeFilter.amount === '' ||
        itemAmount === Number(activeFilter.amount);

      return (
        matchesKeyword &&
        matchesDate &&
        matchesCategory &&
        matchesAmount
      );
    })
    .sort((a, b) => {
      if (a.date === b.date) return Number(b.id) - Number(a.id);
      return b.date.localeCompare(a.date);
    });
});

const totalPeriodicExpense = computed(() => {
  return periodicExpenses.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
});

/* ---------------------------
   거래 내역 기능
--------------------------- */

async function fetchTransactions() {
  const userId = getCurrentUserId();

  if (!userId) {
    transactions.value = [];
    return;
  }

  try {
    const { data } = await axios.get(`${API_BASE}/transactions`, {
      params: { userid: userId },
    });
    transactions.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("거래 내역 조회 실패:", error);
    alert("거래 내역을 불러오지 못했습니다.");
  }
}

async function fetchCategories() {
  try {
    const [incomeRes, expenseRes] = await Promise.all([
      axios.get(`${API_BASE}/incomeCategory`),
      axios.get(`${API_BASE}/expenseCategory`),
    ]);

    incomeCategories.value = Array.isArray(incomeRes.data)
      ? incomeRes.data
      : [];
    expenseCategories.value = Array.isArray(expenseRes.data)
      ? expenseRes.data
      : [];
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    alert("카테고리를 불러오지 못했습니다.");
  }
}

function startAddTransaction() {
  isAddingTransaction.value = true;
  editingTransactionId.value = null;
  selectedNewCategory.value = "";
  newTransaction.date = range.start;
  newTransaction.memo = "";
  newTransaction.amount = null;
  newTransaction.category = "";
  newTransaction.type = "expense";
}

function cancelAddTransaction() {
  isAddingTransaction.value = false;
}

async function createTransaction() {
  const userId = getCurrentUserId();

  if (!userId) {
    alert("로그인 정보가 없습니다.");
    return;
  }

  if (
    !newTransaction.date ||
    !newTransaction.memo ||
    !newTransaction.category ||
    !newTransaction.amount
  ) {
    alert("날짜, 내용, 금액, 분류를 모두 입력해주세요.");
    return;
  }

  const detectedType = detectTransactionType(newTransaction.category);

  try {
    await axios.post(`${API_BASE}/transactions`, {
      userid: userId,
      date: newTransaction.date,
      type: detectedType,
      category: newTransaction.category.trim(),
      detailCategory: "",
      amount: Number(newTransaction.amount),
      memo: newTransaction.memo.trim(),
    });

    isAddingTransaction.value = false;
    await fetchTransactions();
  } catch (error) {
    console.error("거래 내역 추가 실패:", error);
    alert("거래 내역 추가에 실패했습니다.");
  }
}

function beginEditTransaction(item) {
  isAddingTransaction.value = false;
  editingTransactionId.value = String(item.id);
  selectedEditCategory.value = "";
  editingTransaction.id = String(item.id);
  editingTransaction.date = item.date;
  editingTransaction.memo = item.memo;
  editingTransaction.amount = item.amount;
  editingTransaction.category = item.category;
  editingTransaction.type =
    item.type || detectTransactionType(item.category);
}

function cancelEditTransaction() {
  editingTransactionId.value = null;
}

async function updateTransaction() {
  if (
    !editingTransaction.date ||
    !editingTransaction.memo ||
    !editingTransaction.category ||
    !editingTransaction.amount
  ) {
    alert("날짜, 내용, 금액, 분류를 모두 입력해주세요.");
    return;
  }

  const detectedType = detectTransactionType(editingTransaction.category);

  try {
    await axios.patch(`${API_BASE}/transactions/${editingTransaction.id}`, {
      date: editingTransaction.date,
      memo: editingTransaction.memo.trim(),
      amount: Number(editingTransaction.amount),
      category: editingTransaction.category.trim(),
      type: detectedType,
    });

    editingTransactionId.value = null;
    await fetchTransactions();
  } catch (error) {
    console.error("거래 내역 수정 실패:", error);
    alert("거래 내역 수정에 실패했습니다.");
  }
}

async function removeTransaction(id) {
  const ok = window.confirm("이 거래 내역을 삭제할까요?");
  if (!ok) return;

  const targetId = String(id);

  try {
    await axios.delete(`${API_BASE}/transactions/${targetId}`);
    transactions.value = transactions.value.filter(
      (item) => String(item.id) !== targetId
    );

    if (editingTransactionId.value === targetId) {
      editingTransactionId.value = null;
    }
  } catch (error) {
    console.error("거래 내역 삭제 실패:", error);
    alert("거래 내역 삭제에 실패했습니다.");
  }
}



/* ---------------------------
   필터
--------------------------- */

function applyFilter() {
  activeFilter.keyword = draftFilter.keyword;
  activeFilter.date = draftFilter.date;
  activeFilter.category = draftFilter.category;
  activeFilter.amount =
    draftFilter.amount === '' || draftFilter.amount === null
      ? null
      : Number(draftFilter.amount);
}

function resetFilter() {
  draftFilter.keyword = '';
  draftFilter.date = '';
  draftFilter.category = '';
  draftFilter.amount = null;

  activeFilter.keyword = '';
  activeFilter.date = '';
  activeFilter.category = '';
  activeFilter.amount = null;
}

/* ---------------------------
   공통
--------------------------- */

function detectTransactionType(category) {
  const normalized = String(category || "").trim().toLowerCase();

  if (!normalized) return "expense";
  if (normalized === "고정 지출") return "expense";
  if (incomeCategorySet.value.has(normalized)) return "income";
  if (expenseCategorySet.value.has(normalized)) return "expense";
  return "expense";
}

function syncTypeFromCategory(target) {
  if (target === "new") {
    newTransaction.type = detectTransactionType(newTransaction.category);
  } else {
    editingTransaction.type = detectTransactionType(
      editingTransaction.category
    );
  }
}

function applySelectedCategory(target) {
  if (target === "new") {
    if (selectedNewCategory.value) {
      newTransaction.category = selectedNewCategory.value;
      syncTypeFromCategory("new");
    }
  } else {
    if (selectedEditCategory.value) {
      editingTransaction.category = selectedEditCategory.value;
      syncTypeFromCategory("edit");
    }
  }
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

function formatDate(value) {
  if (!value) return '';
  return value.replaceAll('-', '.');
}

function getDayFromDate(dateString) {
  if (!dateString) return '';
  const parts = String(dateString).split('-');
  return Number(parts[2]) || '';
}

function notReady(featureName) {}
</script>

<style scoped>
.transaction-page {
  padding: 8px 0 30px;
  color: #222;
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 800;
  color: #121212;
}

.date-range-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e3e6eb;
  border-radius: 12px;
  padding: 10px 14px;
}

.date-range-box input {
  border: none;
  outline: none;
  background: transparent;
  color: #444;
  font-size: 14px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid #e5e8ef;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.card-large {
  min-height: 690px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.fixed-head-actions,
.filter-btns,
.sub-action {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pill {
  border: none;
  background: #2337ff;
  color: white;
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 700;
}

.line-btn {
  border: 1px solid #d9dde5;
  background: #fff;
  color: #333;
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.line-btn:hover,
.mini-btn:hover {
  opacity: 0.9;
}

.primary-outline {
  border-color: #2337ff;
  color: #2337ff;
}

.total-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f5f9;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

.table-wrap {
  border: 1px solid #edf0f4;
  border-radius: 14px;
  overflow: auto;
}

.table-wrap.tall {
  max-height: 610px;
}

.table-wrap.short {
  max-height: 260px;
}

.data-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table thead th {
  position: sticky;
  top: 0;
  background: #fafbfe;
  z-index: 1;
}

.data-table th,
.data-table td {
  border-bottom: 1px solid #edf0f4;
  border-right: 1px solid #edf0f4;
  padding: 12px 10px;
  font-size: 14px;
  text-align: center;
  word-break: break-word;
  vertical-align: middle;
}

.data-table th:last-child,
.data-table td:last-child {
  border-right: none;
}

.data-table th {
  font-weight: 700;
  color: #333;
}

.manage-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.mini-btn {
  border: 1px solid #d8dce5;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.mini-btn.primary {
  background: #2337ff;
  border-color: #2337ff;
  color: #fff;
}

.mini-btn.danger {
  border-color: #ffb7b7;
  color: #d52b2b;
  background: #fff7f7;
}

.edit-row input,
.edit-row select,
.filter-form input {
  width: 100%;
  border: 1px solid #d9dde5;
  border-radius: 8px;
  padding: 9px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
  box-sizing: border-box;
}

.edit-row input:focus,
.edit-row select:focus,
.filter-form input:focus {
  border-color: #2337ff;
}

.category-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #555;
}

.empty {
  padding: 24px 12px;
  color: #888;
}

.income {
  color: #1565c0;
  font-weight: 700;
}

.expense {
  color: #d32f2f;
  font-weight: 700;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.income-badge {
  color: #1565c0;
  background: #eaf3ff;
}

.expense-badge {
  color: #d32f2f;
  background: #fff0f0;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .card-large {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .page-top {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 28px;
  }

  .date-range-box {
    width: 100%;
    flex-wrap: wrap;
  }

  .date-range-box input {
    width: 100%;
  }
}
</style>
