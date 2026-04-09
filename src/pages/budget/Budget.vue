<template>
  <div class="container">
    <div class="header">
      <h2>예산 관리</h2>
    </div>

    <div class="card-wrapper">
      <div class="card">
        <p class="label">이번 달 총 예산</p>

        <div v-if="!isEditing" class="content-view">
          <p class="value">
            {{ budgetData ? budgetData.amount.toLocaleString() : 0 }}원
          </p>
          <button class="edit-btn blue" @click="startEdit">
            {{ budgetData ? '예산 설정' : '예산 등록하기' }}
          </button>
        </div>

        <div v-else class="content-edit">
          <input
            type="number"
            v-model="newAmount"
            class="edit-input"
            placeholder="금액을 입력하세요"
            ref="amountInput"
          />
          <div class="btn-group">
            <button class="action-btn save" @click="saveBudget(budgetData?.id)">
              저장
            </button>
            <button class="action-btn cancel" @click="cancelEdit">취소</button>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="label">이번 달 남은 예산</p>
        <p class="value">{{ remainingBudget.toLocaleString() }}원</p>
      </div>

      <div class="card highlight">
        <p class="label">오늘의 권장 소비</p>
        <p class="msg" v-if="remainingBudget > 0">
          오늘은
          <span class="highlight-red"
            >{{ dailyRecommended.toLocaleString() }}원</span
          >
          이하로 쓰세요!
        </p>
        <p class="msg" v-else>남은 예산이 없습니다. <br />절약이 필요해요!</p>
      </div>
    </div>

    <div class="report-card" v-if="!loading">
      <p class="report-title">전월 대비 지출 현황</p>

      <div class="chart-container">
        <div class="bar-group">
          <div class="bar-text-group">
            <span class="bar-label">지난달 총 지출</span>
            <span class="bar-value"
              >{{ lastMonthExpense.toLocaleString() }}원</span
            >
          </div>
          <div class="bar gray"></div>
        </div>

        <div class="bar-group">
          <div class="bar-text-group">
            <span class="bar-label">이번 달 총 지출</span>
            <span class="bar-value blue"
              >{{ totalExpense.toLocaleString() }}원</span
            >
          </div>
          <div
            class="bar blue"
            :style="{
              height:
                lastMonthExpense > 0
                  ? (totalExpense / lastMonthExpense) * 150 + 'px'
                  : '0px',
            }"
          ></div>
        </div>
      </div>

      <div class="report-footer">
        지난달 대비 현재
        <span class="highlight-red">{{ savingRate }}%</span> 절약하고 있어요!!
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { budgetApi, transactionApi } from '../../api';
import { getUserInfo } from '../../utils/authutil';

const budgetData = ref(null);
const transactions = ref([]);
const loading = ref(false);
const isEditing = ref(false);
const newAmount = ref(0);
const lastMonthTrans = ref([]);

const userInfo = getUserInfo();
const userid = userInfo ? String(userInfo.id) : '2';

const loadAllData = async () => {
  try {
    loading.value = true;

    const budgetRes = await budgetApi.getBudget(userid);
    const myBudgets = budgetRes.data.filter((b) => String(b.userid) === userid);
    budgetData.value =
      myBudgets.length > 0 ? myBudgets[myBudgets.length - 1] : null;

   
    const transRes = await transactionApi.getExpenses(userid);
    transactions.value = transRes.data.filter(
      (t) => String(t.userid) === userid && t.type === 'expense',
    );

    console.log('필터링된 지출 내역:', transactions.value);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};



const totalExpense = computed(() => {
  return transactions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
});

const lastMonthExpense = computed(() => {
  if (lastMonthTrans.value.length === 0) return 850000;
  return lastMonthTrans.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
});


const remainingBudget = computed(() => {
  const budget = budgetData.value ? Number(budgetData.value.amount) : 0;
  return budget - totalExpense.value;
});

const dailyRecommended = computed(() => {
  if (!budgetData.value || remainingBudget.value <= 0) return 0;
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = lastDay - now.getDate() + 1;
  const result = Math.floor(remainingBudget.value / remainingDays);
  return result > 0 ? result : 0;
});

const savingRate = computed(() => {
  if (lastMonthExpense.value === 0) return 0;
  const rate =
    ((lastMonthExpense.value - totalExpense.value) / lastMonthExpense.value) *
    100;
  return Math.floor(rate);
});

const startEdit = () => {
  newAmount.value = budgetData.value ? budgetData.value.amount : 0;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveBudget = async (budgetId) => {
  try {
    const budgetPayload = {
      userid: userid, 
      amount: Number(newAmount.value),
      date: new Date().toISOString().split('T')[0],
      period: 'current',
      category: '전체',
    };

    if (budgetData.value && budgetData.value.id) {
     
      await budgetApi.updateBudget(budgetData.value.id, budgetPayload);
      alert('예산이 수정되었습니다.');
    } else {
      await budgetApi.createBudget(budgetPayload);
      alert('예산이 신규 등록되었습니다.');
    }

    isEditing.value = false;
    await loadAllData();
  } catch (error) {
    console.error('저장 실패:', error);
    alert('작업 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card-wrapper {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.card {
  flex: 1;
  padding: 24px;
  border-radius: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.label {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}
.value {
  font-size: 26px;
  font-weight: 800;
  color: #222;
}
.edit-btn {
  margin-top: 12px;
  padding: 6px 12px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.report-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  text-align: center;
}
.report-title {
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 30px;
}
.chart-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 80px;
  height: 200px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bar-label {
  font-size: 12px;
  color: #666;
}
.bar-value {
  font-size: 14px;
  font-weight: bold;
}
.bar {
  width: 100px;
  border-radius: 10px 10px 0 0;
}
.bar.gray {
  height: 150px;
  background: #e9e9e9;
}
.bar.blue {
  background: linear-gradient(to top, #69c0ff, #1890ff);
}
.report-footer {
  margin-top: 30px;
  font-size: 22px;
  font-weight: 700;
}
.highlight-red {
  color: #f5222d;
}
</style>
