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
const categories = ref([]);

// 2026년 최저 시급 (사용자 설정 기준)
const HOURLY_WAGE = 10320;

const currentMonthStr = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

const categoryMap = computed(() => {
  const map = {};
  categories.value.forEach(c => {
    map[c.id] = c.name;
    map[c.name] = c.name; 
  });
  return map;
});

const fetchData = async () => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.id) return;

  const currentId = String(userInfo.id);

  try {
    const timestamp = new Date().getTime();
    const [resTrans, resBudget, resWish, resExpCat, resIncCat] = await Promise.all([
      axios.get("/api/transactions", {
        params: { userid: currentId, _t: timestamp },
      }),
      axios.get("/api/budgets", {
        params: { userid: currentId, _t: timestamp },
      }),
      axios.get("/api/wishlists", {
        params: { userid: currentId, _t: timestamp },
      }),
      axios.get("/api/expenseCategory"),
      axios.get("/api/incomeCategory")
    ]);

    transactions.value = resTrans.data || [];
    categories.value = [...(resExpCat.data || []), ...(resIncCat.data || [])];

    const budgets = resBudget.data || [];
    if (budgets.length > 0) {
      // 이번 달 예산 찾기
      const monthlyBudget = budgets.find((b) =>
        String(b.date).startsWith(currentMonthStr.value),
      );
      budgetAmount.value = monthlyBudget
        ? Number(monthlyBudget.amount)
        : Number(budgets[budgets.length - 1].amount);
    }

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

const currentMonthExpense = computed(() => {
  return transactions.value
    .filter(
      (t) =>
        String(t.type).trim() === "expense" &&
        String(t.date).startsWith(currentMonthStr.value),
    )
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
});

const workHoursSpent = computed(() => {
  if (currentMonthExpense.value === 0) return 0;
  return (currentMonthExpense.value / HOURLY_WAGE).toFixed(1);
});

const wishlistAnalysis = computed(() => {
  if (!selectedWishlist.value) return null;

  const item = selectedWishlist.value;
  const remainingCost = item.targetPrice - (item.savedAmount || 0);
  const monthlySurplus = budgetAmount.value - currentMonthExpense.value;

  if (monthlySurplus > 0) {
    const monthsToGoal = Math.ceil(remainingCost / monthlySurplus);
    
    return {
      itemName: item.itemName,
      isGood: true,
      months: monthsToGoal,
      icon: monthsToGoal <= 1 ? "🤩" : "😐",
      message: monthsToGoal <= 1 
        ? `와우! 다음 달이면 ${item.itemName}을(를) 살 수 있어요! 🚀`
        : `이대로만 아끼면 ${monthsToGoal}개월 뒤에 구매 완료!`,
    };
  } else {
    const overspent = Math.abs(monthlySurplus);
    const delayHours = Math.ceil(overspent / HOURLY_WAGE);
    
    return {
      itemName: item.itemName,
      isGood: false,
      icon: "😡",
      message: `예산 초과! ${item.itemName} 구매가 멀어지고 있어요.`,
      subMessage: `초과한 ${overspent.toLocaleString()}원을 벌려면 ${delayHours}시간 더 일해야 해요.`
    };
  }
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
    .filter((t) => t.type === 'income' && String(t.date).startsWith(currentMonthStr.value))
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const expenseTotal = computed(() => {
  return transactions.value
    .filter((t) => t.type === 'expense' && String(t.date).startsWith(currentMonthStr.value))
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

const netProfit = computed(() => incomeTotal.value - expenseTotal.value);

const budgetUsageRate = computed(() => {
  if (budgetAmount.value === 0) return 0;
  // 전체 지출이 아닌 이번 달 지출 기준으로 수정
  return Math.round((currentMonthExpense.value / budgetAmount.value) * 100);
});

onMounted(fetchData);
</script>

<template>
  <div class="dash-grid">
    <section class="dash-main">
      <div class="kb-card reality-check-banner">
        <div class="reality-icon">💸</div>
        <div class="content">
          <h4>현타 계산기</h4>
          <p>
            이번 달 <span class="highlight">지출</span>을 위해 당신은 <br/>
            최저시급({{ HOURLY_WAGE.toLocaleString() }}원) 기준 
            인생의 <span class="highlight">{{ workHoursSpent }}시간</span>을 바쳤습니다.
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
                  <span class="cat-tag">{{ categoryMap[t.category] || t.category }}</span>
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
          <div class="wishlist-status-box" :class="wishlistAnalysis.isGood ? 'good' : 'bad'">
            <div class="status-icon">{{ wishlistAnalysis.icon }}</div>
            <div class="status-content">
              <p v-if="wishlistAnalysis.isGood" class="msg-box good">
                {{ wishlistAnalysis.message }}
              </p>
              <p v-else class="msg-box bad">
                <strong>{{ wishlistAnalysis.message }}</strong><br/>
                <span class="sub-msg">{{ wishlistAnalysis.subMessage }}</span>
              </p>
            </div>
          </div>
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
  gap: 20px;
  padding: 25px;
  background: #fff;
  border: 1px solid #eee;
}
.reality-icon {
  font-size: 42px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
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

/* 위시리스트 동기부여 */
.wishlist-motivation {
  margin-top: 15px;
}
.wishlist-status-box {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 20px;
}
.wishlist-status-box.good { background: #f0f7ff; }
.wishlist-status-box.bad { background: #fff5f5; border: 1px solid #ffebeb; }

.status-icon {
  font-size: 36px;
}
.sub-msg {
  font-size: 0.85em;
  color: #666;
  display: block;
  margin-top: 4px;
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
