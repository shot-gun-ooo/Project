<template>
  <div class="container">
    <h2>예산 관리</h2>

    <div class="card-wrapper" v-if="budgetData">
      <div class="card">
        <p class="label">이번 달 총 예산</p>
        <div v-if="!isEditing">
          <p class="value">{{ budgetData.amount.toLocaleString() }}원</p>
          <button class="edit-btn" @click="startEdit">예산 설정</button>
        </div>
        <div v-else>
          <input type="number" v-model="newAmount" class="edit-input" />
          <div class="btn-group">
            <button @click="saveBudget(budgetData.id)">저장</button>
            <button @click="cancelEdit">취소</button>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="label">이번 달 남은 예산</p>
        <p class="value">{{ remainingBudget.toLocaleString() }}원</p>
      </div>

      <div class="card highlight">
        <p class="label">오늘의 권장 소비</p>
        <p class="msg">
          오늘은
          <span class="highlight-red"
            >{{ dailyRecommended.toLocaleString() }}원</span
          >
          이하로 쓰세요!
        </p>
      </div>
    </div>
    <div class="report-card" v-if="!loading">
      <p class="report-title">전월 대비 지출 현황</p>
      <div class="chart-container">
        <div class="bar-group">
          <span class="bar-label">지난달 총 지출</span>
          <span class="bar-value"
            >{{ lastMonthExpense.toLocaleString() }}원</span
          >
          <div class="bar gray"></div>
        </div>
        <div class="bar-group">
          <span class="bar-label">이번 달 총 지출</span>
          <span class="bar-value">{{ totalExpense.toLocaleString() }}원</span>
          <div
            class="bar blue"
            :style="{ height: (totalExpense / lastMonthExpense) * 150 + 'px' }"
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

const budgetData = ref(null);
const transactions = ref([]);
const loading = ref(false);
const lastMonthExpense = ref(850000);

const isEditing = ref(false);
const newAmount = ref(0);

const startEdit = () => {
  newAmount.value = budgetData.value.amount;

  isEditing.value = true;

  console.log('수정 모드 시작!');
};

const cancelEdit = () => {
  isEditing.value = false;
  newAmount.value = 0;
};

const saveBudget = async (budgetId) => {
  try {
    const budgetPayload = {
      userId: '1',
      amount: Number(newAmount.value),
      date: new Date().toISOString().split('T')[0],
      period: 'current',
      category: '전체',
    };

    if (budgetData.value && budgetData.value.id) {
      const updateData = {
        ...budgetData.value,
        amount: Number(newAmount.value),
      };
      await budgetApi.updateBudget(budgetId, updateData);
      alert('예산이 수정되었습니다.');
    } else {
      await budgetApi.createBudget(budgetPayload);
      alert('예산이 신규 등록되었습니다.');
    }

    isEditing.value = false;
    await loadAllData();
  } catch (error) {
    console.error('저장/수정 실패:', error);
    alert('작업 중 오류가 발생했습니다.');
  }
};

//나중에 합치면 날짜 적용
// const loadAllData = async () => {
//   try {
//     loading.value = true;
//     const budgetRes = await budgetApi.getBudget('1');
//     budgetData.value = budgetRes.data[0];

//     const transRes = await transactionApi.getExpenses('1');
//     transactions.value = transRes.data;
//   } catch (error) {
//     console.error('데이터 로드 실패:', error);
//   } finally {
//     loading.value = false;
//   }
// };

const loadAllData = async () => {
  try {
    loading.value = true;
    const budgetRes = await budgetApi.getBudget('1');
    budgetData.value = budgetRes.data[0];

    const transRes = await transactionApi.getExpenses('1');
    transactions.value = transRes.data;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const dailyRecommended = computed(() => {
  if (!budgetData.value) return 0;

  const now = new Date(); // 오늘 날짜

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const remainingDays = lastDay - now.getDate() + 1;

  const result = Math.floor(remainingBudget.value / remainingDays);

  return result > 0 ? result : 0;
});

const totalExpense = computed(() => {
  return transactions.value.reduce((sum, item) => sum + item.amount, 0);
});

const remainingBudget = computed(() => {
  return budgetData.value ? budgetData.value.amount - totalExpense.value : 0;
});

const savingRate = computed(() => {
  if (lastMonthExpense.value === 0) return 0;
  const rate =
    ((lastMonthExpense.value - totalExpense.value) / lastMonthExpense.value) *
    100;
  return Math.floor(rate);
});

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
