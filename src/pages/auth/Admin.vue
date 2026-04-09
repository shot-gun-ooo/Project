<template>
  <div>
    <h3>수입 카테고리</h3>
    <span>
      <input type="text" v-model="incomeCategoryName" /><button
        @click="addIncomeCategories">
        추가
      </button></span
    >

    <li v-for="item in incomeCategory" :key="item.id">
      {{ item.name }}
      <span>
        <button @click="editIncome(item)">수정</button>
      </span>
      <span><button @click="deleteIncomeCategory(item.id)">삭제</button></span>
    </li>

    <hr />

    <h3>지출 카테고리</h3>
    <span>
      <input type="text" v-model="expenseCategoryName" /><button
        @click="addExpenseCategories">
        추가
      </button></span
    >

    <li v-for="item in expenseCategory" :key="item.id">
      {{ item.name }}
      <span>
        <button @click="editExpense(item)">수정</button>
      </span>
      <span><button @click="deleteExpenseCategory(item.id)">삭제</button></span>
    </li>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';

const incomeCategory = ref([]);
const expenseCategory = ref([]);

const incomeCategoryName = ref(''); // 카테고리 이름 입력할 때 이용
const expenseCategoryName = ref('');

// 1. 수입 / 지출 카테고리 조회
const fetchIncomeCategories = async () => {
  try {
    const response = await axios.get('/api/incomeCategory');
    incomeCategory.value = response.data;
  } catch (error) {
    alert(error.message);
  }
};

const fetchExpenseCategories = async () => {
  try {
    const response = await axios.get('/api/expenseCategory');
    expenseCategory.value = response.data;
  } catch (error) {
    alert(error.message);
  }
};

onMounted(() => {
  fetchIncomeCategories();
  fetchExpenseCategories();
});

// 2. 수입 / 지출 카테고리 추가
const addIncomeCategories = async () => {
  try {
    await axios.post('/api/incomeCategory', {
      name: incomeCategoryName.value,
    });
    alert('카테고리가 추가되었습니다!');
    fetchIncomeCategories();
    incomeCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};

const addExpenseCategories = async () => {
  try {
    await axios.post('/api/expenseCategory', {
      name: expenseCategoryName.value,
    });
    alert('카테고리가 추가되었습니다!');
    fetchExpenseCategories();
    expenseCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};

// 3. 수입 / 지출 카테고리 수정
const updateIncomeCategories = async (id, newName) => {
  try {
    const response = await axios.put(`/api/incomeCategory/${id}`, {
      name: newName,
    });
    fetchIncomeCategories();
    incomeCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};

const updateExpenseCategories = async (id, newName) => {
  try {
    const response = await axios.put(`/api/expenseCategory/${id}`, {
      name: newName,
    });
    fetchExpenseCategories();
    expenseCategoryName.value = '';
  } catch (error) {
    alert(error.message);
  }
};
// 수입 카테고리 수정
const editIncome = (item) => {
  const n = window.prompt('새 이름을 입력하세요', item.name);
  if (n && n.trim() !== '') {
    updateIncomeCategories(item.id, n);
  }
};

// 지출 카테고리 수정
const editExpense = (item) => {
  const n = window.prompt('새 이름을 입력하세요', item.name);
  if (n && n.trim() !== '') {
    updateExpenseCategories(item.id, n);
  }
};

// 4. 수입 / 지출 카테고리 삭제
const deleteIncomeCategory = async (id) => {
  try {
    await axios.delete(`/api/incomeCategory/${id}`);
    fetchIncomeCategories();
  } catch (error) {
    alert(error.message);
  }
};

const deleteExpenseCategory = async (id) => {
  try {
    await axios.delete(`/api/expenseCategory/${id}`);
    fetchExpenseCategories();
  } catch (error) {
    alert(error.message);
  }
};
</script>

<style scoped></style>
