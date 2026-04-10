<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { api } from '@/api/index.js';
import { getUserInfo } from '@/utils/authutil.js';

const transactions = ref([]);
const latestTransactions = ref([]);
const budgetAmount = ref(0);
const wishlists = ref([]);
const selectedWishlist = ref(null);

// 2026년 최저 시급 (사용자 설정 기준)
const HOURLY_WAGE = 10320;

const currentMonthStr = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

const fetchData = async () => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.id) return;

  const currentId = String(userInfo.id);

  try {
    const timestamp = new Date().getTime();
    const [resTrans, resBudget, resWish] = await Promise.all([
      axios.get("/api/transactions", {
        params: { userid: currentId, _t: timestamp },
      }),
      axios.get("/api/budgets", {
        params: { userid: currentId, _t: timestamp },
      }),
      axios.get("/api/wishlists", {
        params: { userid: currentId, _t: timestamp },
      }),
    ]);

    transactions.value = resTrans.data || [];

    const budgets = resBudget.data || [];
    if (budgets.length > 0) {
      const monthlyBudget = budgets.find((b) =>
        String(b.date).startsWith(currentMonthStr.value),
      );
      budgetAmount.value = monthlyBudget
        ? Number(monthlyBudget.amount)
        : Number(budgets[0].amount);
    }

    // 진행 중인 위시리스트 중 랜덤으로 1개 선택
    const activeWishes = (resWish.data || []).filter(
      (w) => w.status !== "completed",
    );
    if (activeWishes.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeWishes.length);
      selectedWishlist.value = activeWishes[randomIndex];
    }

    latestTransactions.value = transactions.value
      .filter((t) => String(t.type).trim() === "expense")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
};

const workHoursSpent = computed(() => {
  if (expenseTotal.value === 0) return 0;
  return (expenseTotal.value / HOURLY_WAGE).toFixed(1);
});

const wishlistAnalysis = computed(() => {
  if (!selectedWishlist.value) return null;

  const item = selectedWishlist.value;
  const budgetGap = budgetAmount.value - expenseTotal.value;

  // 예산 잔액을 시급(8시간 근무) 기준으로 환산하여 구매 가능일수 계산
  const impactDays = Math.abs(Math.floor(budgetGap / (HOURLY_WAGE * 8)));

  return {
    itemName: item.itemName,
    isGood: budgetGap >= 0,
    days: impactDays > 0 ? impactDays : 1,
  };
});

const monthlyStats = computed(() => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = `${d.getMonth() + 1}월`;
    const total = transactions.value
      .filter(
        (t) =>
          String(t.type).trim() === "expense" &&
          String(t.date).startsWith(monthStr),
      )
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    months.push({ label: monthLabel, total });
  }
  return months;
});

const incomeTotal = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const expenseTotal = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const netProfit = computed(() => incomeTotal.value - expenseTotal.value);

const budgetUsageRate = computed(() => {
  if (budgetAmount.value === 0) return 0;
  return Math.round((expenseTotal.value / budgetAmount.value) * 100);
});

onMounted(fetchData);
</script>

<template>
  <div class="dash-grid">
    <section class="dash-main">
      <div class="kb-card reality-check-banner">
        <div class="icon">⏰</div>
        <div class="content">
          <h4>현타 계산기</h4>
          <p>
            이번 달 지출을 위해 당신은
            <span class="highlight">{{ workHoursSpent }}시간</span> 동안
            일했습니다.
          </p>
        </div>
      </div>

      <div class="kb-card chart-box">
        <div class="chart-header">
          <h3>지출 월별 요약</h3>
          <span class="sub-text">최근 6개월 지출 추이</span>
        </div>
        <div class="area-chart-container">
          <div class="grid-lines">
            <div v-for="n in 4" :key="n" class="grid-line"></div>
          </div>
          <div class="month-labels">
            <div v-for="m in monthlyStats" :key="m.label" class="month-item">
              <div class="bar-container">
                <div
                  class="stat-bar"
                  :style="{ height: Math.min(m.total / 10000, 100) + 'px' }"
                ></div>
              </div>
              <span class="m-label">{{ m.label }}</span>
              <span class="m-total">{{ (m.total / 10000).toFixed(0) }}만</span>
            </div>
          </div>
        </div>
      </div>

      <div class="kb-card list-box">
        <h3>최근 소비 목록</h3>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>날짜</th>
                <th>메모</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in latestTransactions" :key="t.id">
                <td>
                  <span class="cat-tag">{{ t.category }}</span>
                </td>
                <td>{{ t.date }}</td>
                <td>{{ t.memo }}</td>
                <td class="expense">
                  -{{ Number(t.amount).toLocaleString() }}원
                </td>
              </tr>
              <tr v-if="latestTransactions.length === 0">
                <td colspan="4" class="no-data">지출 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="dash-side">
      <div class="summary-area">
        <div class="kb-card summary pastel-blue">
          <span class="label">이번 달 총 수입</span>
          <strong>{{ incomeTotal.toLocaleString() }}원</strong>
        </div>
        <div class="kb-card summary pastel-red">
          <span class="label">이번 달 총 지출</span>
          <strong>{{ expenseTotal.toLocaleString() }}원</strong>
        </div>
        <div class="kb-card summary pastel-dark">
          <span class="label">현재 잔액</span>
          <strong>{{ netProfit.toLocaleString() }}원</strong>
        </div>
      </div>

      <div class="kb-card budget-box">
        <h3>예산 현황</h3>
        <div class="usage-bar-bg">
          <div
            class="usage-bar-fill"
            :style="{ width: Math.min(budgetUsageRate, 100) + '%' }"></div>
        </div>
        <p class="usage-text">
          총 {{ budgetAmount.toLocaleString() }}원 중
          <strong>{{ budgetUsageRate }}%</strong> 사용 중
        </p>

        <div class="wishlist-motivation" v-if="wishlistAnalysis">
          <div class="divider"></div>
          <p v-if="wishlistAnalysis.isGood" class="msg-box good">
            🚀 지금처럼 아끼면
            <strong>{{ wishlistAnalysis.itemName }}</strong> 구매가
            <span class="blue-text">{{ wishlistAnalysis.days }}일</span>
            빨라집니다!
          </p>
          <p v-else class="msg-box bad">
            ⚠️ 예산 초과로
            <strong>{{ wishlistAnalysis.itemName }}</strong> 구매가
            <span class="red-text">{{ wishlistAnalysis.days }}일</span> 늦어지고
            있어요.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dash-grid {
  display: flex;
  gap: 30px;
  padding: 20px;
}
.dash-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.dash-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 현타 계산기 배너 */
.reality-check-banner {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
}
.reality-check-banner h4 {
  margin: 0;
  font-size: 14px;
  color: #888;
}
.reality-check-banner p {
  margin: 5px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.highlight {
  color: #ff5e5e;
  text-decoration: underline;
}

/* 위시리스트 동기부여 (사이드바 내부) */
.wishlist-motivation {
  margin-top: 15px;
}
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 15px 0;
}
.msg-box {
  font-size: 13px;
  line-height: 1.5;
  color: #555;
  padding: 10px;
  border-radius: 12px;
}
.msg-box.good {
  background: #f0f7ff;
}
.msg-box.bad {
  background: #fff5f5;
}
.blue-text {
  color: #2b78e4;
  font-weight: 800;
}
.red-text {
  color: #e44d4d;
  font-weight: 800;
}

.kb-card {
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.sub-text {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
.area-chart-container {
  position: relative;
  height: 200px;
  margin-top: 30px;
}
.grid-lines {
  position: absolute;
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0;
}
.grid-line {
  border-top: 1px dashed #f0f0f0;
  width: 100%;
  height: 1px;
}
.month-labels {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}
.month-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bar-container {
  height: 100px;
  display: flex;
  align-items: flex-end;
  background: #f5f5f5;
  width: 35px;
  border-radius: 6px;
  overflow: hidden;
}
.stat-bar {
  width: 100%;
  background: #ff7e7e;
  border-radius: 4px;
  transition: height 0.5s ease;
}
.m-label {
  font-size: 13px;
  font-weight: 700;
  color: #333;
}
.m-total {
  font-size: 11px;
  color: #e44d4d;
  font-weight: 600;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  color: #888;
  border-bottom: 1px solid #eee;
}
td {
  padding: 15px 12px;
  font-size: 14px;
  border-bottom: 1px solid #fafafa;
}
.expense {
  color: #e44d4d;
  font-weight: bold;
}
.cat-tag {
  background: #f0f4f8;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}
.no-data {
  text-align: center;
  padding: 40px !important;
  color: #ccc;
}
.summary-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.summary strong {
  display: block;
  font-size: 24px;
  margin-top: 10px;
  font-weight: 800;
}
.pastel-blue {
  background: #eef6ff;
  color: #2b78e4;
  border: none;
}
.pastel-red {
  background: #fff1f1;
  color: #e44d4d;
  border: none;
}
.pastel-dark {
  background: #f8f9fa;
  color: #333;
  border: none;
}
.usage-bar-bg {
  width: 100%;
  height: 12px;
  background: #eee;
  border-radius: 66px;
  margin: 20px 0 10px;
  overflow: hidden;
}
.usage-bar-fill {
  height: 100%;
  background: #2b78e4;
  transition: width 0.6s ease;
}
.usage-text {
  font-size: 14px;
  color: #666;
}
</style>
