<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api/index.js';

const transactions = ref([]);
const latestTransactions = ref([]);
const budgetAmount = ref(0);

// [데이터 로드] db.json 연동
const fetchData = async () => {
  try {
    const [resTrans, resBudget] = await Promise.all([
      api.getTransactions(),
      api.getBudgets(),
    ]);

    transactions.value = resTrans.data;

    if (resBudget.data.length > 0) {
      budgetAmount.value = resBudget.data[0].amount;
    }

    // [최근 소비 목록] 날짜 내림차순 정렬 후 상위 5건 추출
    latestTransactions.value = [...resTrans.data]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
};

// [계산 로직]
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
      <div class="kb-card chart-box">
        <div class="chart-header">
          <h3>지출 월별 요약</h3>
        </div>
        <div class="area-chart-container">
          <div class="grid-lines">
            <div v-for="n in 4" :key="n" class="grid-line"></div>
          </div>
          <svg viewBox="0 0 600 200" class="chart-svg">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(255, 126, 126, 0.4)" />
                <stop offset="100%" stop-color="rgba(255, 126, 126, 0)" />
              </linearGradient>
            </defs>
            <path
              d="M0,180 C100,160 200,170 300,90 C400,60 500,110 600,70 L600,200 L0,200 Z"
              fill="url(#chart-gradient)" />
            <path
              d="M0,180 C100,160 200,170 300,90 C400,60 500,110 600,70"
              fill="none"
              stroke="#ff7e7e"
              stroke-width="4"
              stroke-linecap="round" />
            <circle cx="300" cy="90" r="6" fill="#ff7e7e" />
          </svg>
          <div class="month-labels">
            <span>1월</span><span>2월</span><span>3월</span><span>4월</span
            ><span>5월</span><span>6월</span>
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
                <td :class="t.type">
                  {{ Number(t.amount).toLocaleString() }}원
                </td>
              </tr>
              <tr v-if="latestTransactions.length === 0">
                <td colspan="4" class="no-data">거래 내역이 없습니다.</td>
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
        <p>
          목표 대비 <strong>{{ budgetUsageRate }}%</strong> 사용 중
        </p>
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

.kb-card {
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 그래프 스타일 */
.area-chart-container {
  position: relative;
  height: 250px;
  margin-top: 20px;
}
.grid-lines {
  position: absolute;
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-line {
  border-top: 1px dashed #f0f0f0;
  width: 100%;
  height: 1px;
}
.chart-svg {
  width: 100%;
  height: 200px;
  position: relative;
  z-index: 2;
}
.month-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding: 0 10px;
  font-size: 13px;
  color: #999;
}

/* 테이블 스타일 */
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
.income {
  color: #2b78e4;
  font-weight: bold;
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

/* 우측 카드 디자인 */
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
  border-radius: 6px;
  margin: 20px 0 10px;
  overflow: hidden;
}
.usage-bar-fill {
  height: 100%;
  background: #2b78e4;
  transition: width 0.6s ease;
}
</style>
