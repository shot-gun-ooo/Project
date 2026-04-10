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
          <button class="line-btn" @click="startAddTransaction">추가</button>
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
              <tr v-if="isAddingTransaction" class="edit-row">
                <td>
                  <input type="date" v-model="newTransaction.date" />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="newTransaction.memo"
                    placeholder="내용 입력"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="newTransaction.amount"
                    placeholder="금액"
                  />
                </td>
                <td>
                  <div class="category-field">
                    <select
                      v-model="selectedNewCategory"
                      @change="applySelectedCategory('new')"
                    >
                      <option value="">직접 입력</option>
                      <optgroup label="수입">
                        <option
                          v-for="name in incomeCategories"
                          :key="`new-income-${name}`"
                          :value="name"
                        >
                          {{ name }}
                        </option>
                      </optgroup>
                      <optgroup label="지출">
                        <option
                          v-for="name in expenseCategories"
                          :key="`new-expense-${name}`"
                          :value="name"
                        >
                          {{ name }}
                        </option>
                      </optgroup>
                    </select>

                    <input
                      type="text"
                      v-model="newTransaction.category"
                      placeholder="또는 직접 입력"
                      @input="syncTypeFromCategory('new')"
                    />
                  </div>
                </td>
                <td>
                  <span
                    class="type-badge"
                    :class="
                      newTransaction.type === 'income'
                        ? 'income-badge'
                        : 'expense-badge'
                    "
                  >
                    {{
                      newTransaction.type === "income" ? "수입(+)" : "지출(-)"
                    }}
                  </span>
                </td>
                <td class="manage-cell">
                  <button class="mini-btn primary" @click="createTransaction">
                    저장
                  </button>
                  <button class="mini-btn" @click="cancelAddTransaction">
                    취소
                  </button>
                </td>
              </tr>

              <tr v-for="item in filteredTransactions" :key="String(item.id)">
                <template v-if="editingTransactionId === String(item.id)">
                  <td>
                    <input type="date" v-model="editingTransaction.date" />
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="editingTransaction.memo"
                      placeholder="내용 입력"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      v-model.number="editingTransaction.amount"
                      placeholder="금액"
                    />
                  </td>
                  <td>
                    <div class="category-field">
                      <select
                        v-model="selectedEditCategory"
                        @change="applySelectedCategory('edit')"
                      >
                        <option value="">분류 선택</option>
                        <optgroup label="수입">
                          <option
                            v-for="name in incomeCategories"
                            :key="`edit-income-${name}`"
                            :value="name"
                          >
                            {{ name }}
                          </option>
                        </optgroup>
                        <optgroup label="지출">
                          <option
                            v-for="name in expenseCategories"
                            :key="`edit-expense-${name}`"
                            :value="name"
                          >
                            {{ name }}
                          </option>
                        </optgroup>
                      </select>

                      <input
                        type="text"
                        v-model="editingTransaction.category"
                        placeholder="또는 직접 입력"
                        @input="syncTypeFromCategory('edit')"
                      />
                    </div>
                  </td>
                  <td>
                    <span
                      class="type-badge"
                      :class="
                        editingTransaction.type === 'income'
                          ? 'income-badge'
                          : 'expense-badge'
                      "
                    >
                      {{
                        editingTransaction.type === "income"
                          ? "수입(+)"
                          : "지출(-)"
                      }}
                    </span>
                  </td>
                  <td class="manage-cell">
                    <button class="mini-btn primary" @click="updateTransaction">
                      저장
                    </button>
                    <button class="mini-btn" @click="cancelEditTransaction">
                      취소
                    </button>
                  </td>
                </template>

                <template v-else>
                  <td>{{ formatDate(item.date) }}</td>
                  <td>{{ item.memo }}</td>
                  <td
                    :class="{
                      income: item.type === 'income',
                      expense: item.type !== 'income',
                    }"
                  >
                    {{ item.type === "income" ? "+" : "-"
                    }}{{ formatCurrency(item.amount) }}
                  </td>
                  <td>{{ item.category }}</td>
                  <td>
                    <span
                      class="type-badge"
                      :class="
                        item.type === 'income'
                          ? 'income-badge'
                          : 'expense-badge'
                      "
                    >
                      {{ item.type === "income" ? "수입" : "지출" }}
                    </span>
                  </td>
                  <td class="manage-cell">
                    <button class="mini-btn" @click="beginEditTransaction(item)">
                      수정
                    </button>
                    <button
                      class="mini-btn danger"
                      @click="removeTransaction(item.id)"
                    >
                      삭제
                    </button>
                  </td>
                </template>
              </tr>

              <tr
                v-if="
                  !isAddingTransaction && filteredTransactions.length === 0
                "
              >
                <td colspan="6" class="empty">표시할 거래 내역이 없습니다.</td>
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
                <span>합계:</span>
                <strong>{{ formatCurrency(totalPeriodicExpense) }}</strong>
              </div>
              <button
                class="line-btn"
                @click="savePeriodicExpensesToTransactions"
              >
                저장
              </button>
            </div>
          </div>

          <div class="sub-action">
            <button class="line-btn" @click="startAddPeriodicExpense">
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
                      class="mini-btn primary"
                      @click="createPeriodicExpense"
                    >
                      저장
                    </button>
                    <button class="mini-btn" @click="cancelAddPeriodicExpense">
                      취소
                    </button>
                  </td>
                </tr>

                <tr v-for="item in periodicExpenses" :key="String(item.id)">
                  <template v-if="editingPeriodicExpenseId === String(item.id)">
                    <td>
                      <input
                        type="text"
                        v-model="editingPeriodicExpense.memo"
                        placeholder="내용 입력"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        v-model.number="editingPeriodicExpense.amount"
                        placeholder="비용"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        v-model.number="editingPeriodicExpense.payDay"
                      />
                    </td>
                    <td class="manage-cell">
                      <button
                        class="mini-btn primary"
                        @click="updatePeriodicExpense"
                      >
                        저장
                      </button>
                      <button
                        class="mini-btn"
                        @click="cancelEditPeriodicExpense"
                      >
                        취소
                      </button>
                    </td>
                  </template>

                  <template v-else>
                    <td>{{ item.memo }}</td>
                    <td class="expense">-{{ formatCurrency(item.amount) }}</td>
                    <td>{{ getDayFromDate(item.date) }}일</td>
                    <td class="manage-cell">
                      <button
                        class="mini-btn"
                        @click="beginEditPeriodicExpense(item)"
                      >
                        수정
                      </button>
                      <button
                        class="mini-btn danger"
                        @click="removePeriodicExpense(item.id)"
                      >
                        삭제
                      </button>
                    </td>
                  </template>
                </tr>

                <tr
                  v-if="
                    !isAddingPeriodicExpense && periodicExpenses.length === 0
                  "
                >
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
                placeholder="검색어"
              />
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
                placeholder="예) 식비"
              />
            </div>

            <div class="form-group">
              <label>가격</label>
              <input
                type="number"
                min="0"
                v-model.number="draftFilter.amount"
                placeholder="예) 10000"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { getUserInfo } from "@/utils/authutil";

const API_BASE = "/api";

function getCurrentUserId() {
  const userInfo = getUserInfo(); //로그인 사용자
  return userInfo?.authenticated ? String(userInfo.id) : null;
}

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
const lastDayOfMonth = new Date(
  currentYear,
  today.getMonth() + 1,
  0
).getDate();

const range = reactive({
  start: `${currentYear}-${currentMonth}-01`,
  end: `${currentYear}-${currentMonth}-${String(lastDayOfMonth).padStart(
    2,
    "0"
  )}`,
});

const transactions = ref([]);
const periodicExpenses = ref([]);
const incomeCategories = ref([]);
const expenseCategories = ref([]);

const isAddingTransaction = ref(false); //내역에서 추가 누르면 true
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

const draftFilter = reactive({  //입력
  keyword: "",
  date: "",
  category: "",
  amount: null,
});

const activeFilter = reactive({  //검색
  keyword: "",
  date: "",
  category: "",
  amount: null,
});

const incomeCategorySet = computed(() => {
  return new Set(
    incomeCategories.value.map((item) =>
      String(item).trim().toLowerCase()
    )
  );
});

const expenseCategorySet = computed(() => {
  return new Set(
    expenseCategories.value.map((item) =>
      String(item).trim().toLowerCase()
    )
  );
});

const filteredTransactions = computed(() => {  //날짜반영
  return [...transactions.value]
    .filter((item) => isInRange(item.date))
    .filter((item) => {
      const keyword = activeFilter.keyword.trim().toLowerCase();
      const category = activeFilter.category.trim().toLowerCase();
      const itemMemo = String(item.memo || "").toLowerCase();
      const itemCategory = String(item.category || "").toLowerCase();
      const itemAmount = Number(item.amount || 0);

      const matchesKeyword = !keyword || itemMemo.includes(keyword);
      const matchesDate = !activeFilter.date || item.date === activeFilter.date;
      const matchesCategory = !category || itemCategory.includes(category);
      const matchesAmount =
        activeFilter.amount === null ||
        activeFilter.amount === "" ||
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

const totalPeriodicExpense = computed(() => {  //고정지출 합계
  return periodicExpenses.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
});

onMounted(async () => {
  await Promise.all([
    fetchTransactions(),
    fetchPeriodicExpenses(),
    fetchCategories(),
  ]);
});

async function fetchTransactions() {  //내역
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

async function fetchPeriodicExpenses() {  //고정지출
  const userId = getCurrentUserId();

  if (!userId) {
    periodicExpenses.value = [];
    return;
  }

  try {
    const { data } = await axios.get(`${API_BASE}/periodicExpense`, {
      params: { userid: userId },
    });

    periodicExpenses.value = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          payDay: getDayFromDate(item.date),
        }))
      : [];
  } catch (error) {
    console.error("고정 지출 조회 실패:", error);
    alert("월 고정 지출을 불러오지 못했습니다.");
  }
}

async function fetchCategories() {
  try {
    const [incomeRes, expenseRes] = await Promise.all([
      axios.get(`${API_BASE}/incomeCategory`),
      axios.get(`${API_BASE}/expenseCategory`),
    ]);

    incomeCategories.value = Array.isArray(incomeRes.data)
      ? incomeRes.data.map((item) => item.name)
      : [];

    expenseCategories.value = Array.isArray(expenseRes.data)
      ? expenseRes.data.map((item) => item.name)
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

async function createTransaction() {  //저장 누르면 검증 후 POST요청
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
  editingTransactionId.value = String(item.id); //수정 누르면 id를 여기 저장(수정모드)
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

function startAddPeriodicExpense() {
  isAddingPeriodicExpense.value = true;
  editingPeriodicExpenseId.value = null;
  newPeriodicExpense.memo = "";
  newPeriodicExpense.amount = null;
  newPeriodicExpense.payDay = 1;
}

function cancelAddPeriodicExpense() {
  isAddingPeriodicExpense.value = false;
}

async function createPeriodicExpense() {
  const userId = getCurrentUserId();

  if (!userId) {
    alert("로그인 정보가 없습니다.");
    return;
  }

  if (
    !newPeriodicExpense.memo ||
    !newPeriodicExpense.amount ||
    !newPeriodicExpense.payDay
  ) {
    alert("내용, 비용, 결제일을 모두 입력해주세요.");
    return;
  }

  const payDay = clampDay(newPeriodicExpense.payDay);
  const fixedDate = buildDateFromDay(
    currentYear,
    Number(currentMonth),
    payDay
  );

  try {
    await axios.post(`${API_BASE}/periodicExpense`, {
      userid: userId,
      date: fixedDate,
      type: "expense",
      category: "고정 지출",
      amount: Number(newPeriodicExpense.amount),
      memo: newPeriodicExpense.memo.trim(),
    });

    isAddingPeriodicExpense.value = false;
    await fetchPeriodicExpenses();
  } catch (error) {
    console.error("고정 지출 추가 실패:", error);
    alert("고정 지출 추가에 실패했습니다.");
  }
}

function beginEditPeriodicExpense(item) {
  isAddingPeriodicExpense.value = false;
  editingPeriodicExpenseId.value = String(item.id);
  editingPeriodicExpense.id = String(item.id);
  editingPeriodicExpense.memo = item.memo;
  editingPeriodicExpense.amount = item.amount;
  editingPeriodicExpense.payDay = getDayFromDate(item.date);
}

function cancelEditPeriodicExpense() {
  editingPeriodicExpenseId.value = null;
}

async function updatePeriodicExpense() {
  if (
    !editingPeriodicExpense.memo ||
    !editingPeriodicExpense.amount ||
    !editingPeriodicExpense.payDay
  ) {
    alert("내용, 비용, 결제일을 모두 입력해주세요.");
    return;
  }

  const payDay = clampDay(editingPeriodicExpense.payDay);
  const fixedDate = buildDateFromDay(
    currentYear,
    Number(currentMonth),
    payDay
  );

  try {
    await axios.patch(
      `${API_BASE}/periodicExpense/${editingPeriodicExpense.id}`,
      {
        memo: editingPeriodicExpense.memo.trim(),
        amount: Number(editingPeriodicExpense.amount),
        date: fixedDate,
        category: "고정 지출",
        type: "expense",
      }
    );

    editingPeriodicExpenseId.value = null;
    await fetchPeriodicExpenses();
  } catch (error) {
    console.error("고정 지출 수정 실패:", error);
    alert("고정 지출 수정에 실패했습니다.");
  }
}

async function removePeriodicExpense(id) {
  const ok = window.confirm("이 월 고정 지출을 삭제할까요?");
  if (!ok) return;

  const targetId = String(id);

  try {
    await axios.delete(`${API_BASE}/periodicExpense/${targetId}`);
    periodicExpenses.value = periodicExpenses.value.filter(
      (item) => String(item.id) !== targetId
    );

    if (editingPeriodicExpenseId.value === targetId) {
      editingPeriodicExpenseId.value = null;
    }
  } catch (error) {
    console.error("고정 지출 삭제 실패:", error);
    alert("고정 지출 삭제에 실패했습니다.");
  }
}

async function savePeriodicExpensesToTransactions() { //고정을 내역에 반영
  const userId = getCurrentUserId();

  if (!userId) {
    alert("로그인 정보가 없습니다.");
    return;
  }

  if (periodicExpenses.value.length === 0) {
    alert("저장할 월 고정 지출이 없습니다.");
    return;
  }

  try {
    const { data: currentTransactions } = await axios.get(
      `${API_BASE}/transactions`,
      {
        params: { userid: userId },
      }
    );

    const tasks = [];

    for (const item of periodicExpenses.value) {
      const payDay = clampDay(getDayFromDate(item.date));
      const targetDate = buildDateFromDayByRangeMonth(range.start, payDay);

      const exists = (currentTransactions || []).some((tx) => {
        return (
          String(tx.userid) === String(userId) &&
          tx.date === targetDate &&
          tx.memo === item.memo &&
          Number(tx.amount) === Number(item.amount) &&
          tx.category === "고정 지출"
        );
      });

      if (!exists) {
        tasks.push(
          axios.post(`${API_BASE}/transactions`, {
            userid: userId,
            date: targetDate,
            type: "expense",
            category: "고정 지출",
            detailCategory: "",
            amount: Number(item.amount),
            memo: item.memo,
          })
        );
      }
    }

    await Promise.all(tasks);
    await fetchTransactions();
    alert("월 고정 지출이 거래 내역에 반영되었습니다.");
  } catch (error) {
    console.error("고정 지출 저장 실패:", error);
    alert("고정 지출 저장에 실패했습니다.");
  }
}

function applyFilter() {
  activeFilter.keyword = draftFilter.keyword;
  activeFilter.date = draftFilter.date;
  activeFilter.category = draftFilter.category;
  activeFilter.amount =
    draftFilter.amount === "" || draftFilter.amount === null
      ? null
      : Number(draftFilter.amount);
}

function resetFilter() {
  draftFilter.keyword = "";
  draftFilter.date = "";
  draftFilter.category = "";
  draftFilter.amount = null;

  activeFilter.keyword = "";
  activeFilter.date = "";
  activeFilter.category = "";
  activeFilter.amount = null;
}

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
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  if (!value) return "";
  return value.replaceAll("-", ".");
}

function isInRange(date) {
  if (!range.start || !range.end) return true;
  return date >= range.start && date <= range.end;
}

function getDayFromDate(dateString) {
  if (!dateString) return 1;
  const parts = String(dateString).split("-");
  return Number(parts[2]) || 1;
}

function clampDay(day) {
  const n = Number(day) || 1;
  if (n < 1) return 1;
  if (n > 31) return 31;
  return n;
}

function buildDateFromDay(year, month, day) {
  const lastDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(Number(day), lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(
    2,
    "0"
  )}`;
}

function buildDateFromDayByRangeMonth(baseDate, day) {
  const [year, month] = baseDate.split("-").map(Number);
  return buildDateFromDay(year, month, day);
}
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