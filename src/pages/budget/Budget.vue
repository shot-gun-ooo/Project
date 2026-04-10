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
            ref="amountInput"
            min="0"
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
          <div
            class="bar gray"
            :style="{ height: lastMonthHeight + '%' }"
          ></div>
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
            :style="{ height: currentMonthHeight + '%' }"
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
const lastMonthTrans = ref([]);
const loading = ref(false);
const isEditing = ref(false);
const newAmount = ref(0);

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
    const allExpenses = transRes.data.filter(
      (t) => String(t.userid) === userid && t.type === 'expense',
    );

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const lastDate = new Date(curYear, curMonth - 1, 1);
    const lastYear = lastDate.getFullYear();
    const lastMonth = lastDate.getMonth();

    transactions.value = allExpenses.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });

    lastMonthTrans.value = allExpenses.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === lastYear && d.getMonth() === lastMonth;
    });
  } catch (error) {
    console.error(error);
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
  return Math.max(0, Math.floor(remainingBudget.value / remainingDays));
});

const savingRate = computed(() => {
  if (lastMonthExpense.value === 0) return 0;
  return Math.floor(
    ((lastMonthExpense.value - totalExpense.value) / lastMonthExpense.value) *
      100,
  );
});

const lastMonthHeight = computed(() => {
  const max = Math.max(totalExpense.value, lastMonthExpense.value);
  return max === 0 ? 0 : (lastMonthExpense.value / max) * 100;
});

const currentMonthHeight = computed(() => {
  const max = Math.max(totalExpense.value, lastMonthExpense.value);
  return max === 0 ? 0 : (totalExpense.value / max) * 100;
});

const startEdit = () => {
  newAmount.value = budgetData.value ? budgetData.value.amount : 0;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveBudget = async (budgetId) => {
  if (newAmount.value < 0) {
    alert('예산은 0원보다 작을 수 없습니다. 다시 입력해주세요.');
    return;
  }

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
    } else {
      await budgetApi.createBudget(budgetPayload);
    }
    isEditing.value = false;
    await loadAllData();
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.container {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.card-wrapper {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}
.card {
  flex: 1;
  padding: 24px;
  border-radius: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-bottom: 50px;
}
.chart-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 100px;
  height: 200px;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 10px;
  margin: 40px 0;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.bar-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  width: 150px;
}
.bar {
  width: 80px;
  border-radius: 8px 8px 0 0;
  transition: height 0.6s ease-in-out;
}
.bar.gray {
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
.edit-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.edit-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 10px;
}
.btn-group {
  display: flex;
  gap: 8px;
}
.action-btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.action-btn.save {
  background: #4e73df;
  color: white;
}
.action-btn.cancel {
  background: #eee;
}
</style>
