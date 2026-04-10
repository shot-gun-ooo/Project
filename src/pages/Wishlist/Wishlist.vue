<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  getWishlists,
  getWishlistById,
  createWishlist,
  deleteWishlist,
  updateSavedAmount,
} from '@/api/wishlist.js';
import { getPurchases, createPurchase } from '@/api/purchase.js';
import { getUserInfo } from '@/utils/authutil';
import axios from 'axios';

const router = useRouter();
const userid = ref(null);
const wishlists = ref([]);
const purchases = ref([]);
const selectedWishlistId = ref('');
const isLoading = ref(false);

const today = new Date().toISOString().split('T')[0];

const onlyNumber = (value) => String(value).replace(/[^0-9]/g, '');

const moneyInput = ref('');

const form = reactive({
  itemName: '',
  targetPrice: '',
  targetDate: '',
});

const getProgress = (saved, target) => {
  if (!target || target === 0) return 0;
  return Math.floor((saved / target) * 100);
};

const getCircleStyle = (saved, target) => {
  const pct = getProgress(saved, target);
  return {
    background: `conic-gradient(#73beff ${pct * 3.6}deg, #edf8ff 0deg)`,
  };
};

const getDday = (date) => {
  const target = new Date(date);
  const today = new Date();
  const diff = target - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getDailyAmount = (target, saved, date) => {
  const dday = getDday(date);
  if (dday <= 0) return target - saved;
  return Math.ceil((target - saved) / dday);
};

// --- 데이터 통신 (API) ---

const fetchAll = async () => {
  try {
    isLoading.value = true;

    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.authenticated) {
      alert('로그인이 필요합니다.');
      router.push({ name: 'users/login' });
      return;
    }

    userid.value = String(userInfo.id);

    const [wishRes, purRes] = await Promise.all([
      getWishlists(),
      getPurchases(),
    ]);

    wishlists.value = wishRes.data.filter(
      (item) => String(item.userid) === userid.value,
    );

    purchases.value = purRes.data.filter(
      (item) => String(item.userid) === userid.value,
    );
  } catch (error) {
    console.error('데이터 로드 중 에러 발생:', error);
    alert('데이터를 불러오지 못했습니다.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAll();
});

const activeWishlists = computed(() =>
  wishlists.value.filter(
    (item) => item.status === 'proceeding' || !item.status,
  ),
);

const purchaseList = computed(() => purchases.value);

const addWishlist = async () => {
  if (!form.targetPrice) {
    alert('숫자만 입력하세요');
    return;
  }

  if (form.targetDate < today) {
    alert('날짜는 오늘 이후만 가능합니다');
    return;
  }
  if (!form.itemName.trim() || !form.targetPrice || !form.targetDate) {
    alert('모든 항목을 입력해주세요.');
    return;
  }
  try {
    await createWishlist({
      userid: userid.value,
      itemName: form.itemName.trim(),
      targetPrice: Number(form.targetPrice),
      savedAmount: 0,
      targetDate: form.targetDate,
      status: 'proceeding',
    });
    form.itemName = '';
    form.targetPrice = '';
    form.targetDate = '';
    await fetchAll();
    alert('위시리스트가 추가되었습니다!');
  } catch (error) {
    alert('등록 중 오류가 발생했습니다.');
  }
};

const addMoney = async (wishlist) => {
  moneyInput.value = '';

  while (true) {
    const input = prompt('추가할 금액을 입력하세요.', moneyInput.value);
    if (input === null) return;

    // 숫자만 남기기 (문자 입력 방지)
    const numericValue = onlyNumber(input);

    if (!numericValue) {
      alert('숫자만 입력해주세요.');
      continue;
    }

    const amount = Number(numericValue);

    if (amount <= 0) {
      alert('0원보다 큰 금액을 입력해주세요.');
      continue;
    }

    try {
      // 목표 금액 초과하지 않도록 제한
      const nextSavedAmount = Math.min(
        Number(wishlist.targetPrice),
        Number(wishlist.savedAmount) + amount,
      );

      // 1. 위시리스트 저축 금액 업데이트
      await updateSavedAmount(wishlist.id, nextSavedAmount);

      // 2. 거래내역에 "저축" 기록 추가
      await axios.post('http://127.0.0.1:3000/transactions', {
        userid: userid.value,
        date: new Date().toISOString().slice(0, 10),
        type: 'expense',
        category: '저축',
        amount: amount,
        memo: `${wishlist.itemName} 저축`,
      });

      // DB 기준으로 화면 다시 렌더링
      await fetchAll();

      alert(`${amount.toLocaleString()}원이 저축 내역에 저장되었습니다.`);
      break;
    } catch (error) {
      console.error('돈 넣기 처리 실패:', error);
      alert('돈 넣기 처리에 실패했습니다.');
      break;
    }
  }
};

const removeSelectedWishlist = async () => {
  if (!selectedWishlistId.value) return alert('항목을 선택해주세요.');
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteWishlist(selectedWishlistId.value);
    selectedWishlistId.value = '';
    await fetchAll();
  } catch (error) {
    alert('삭제에 실패했습니다.');
  }
};

const completePurchase = async () => {
  if (!selectedWishlistId.value) {
    alert('항목을 선택해주세요.');
    return;
  }

  try {
    // 선택한 위시리스트 데이터 가져오기
    const wishlistRes = await getWishlistById(selectedWishlistId.value);
    const wishlist = wishlistRes.data;

    // 1. 위시리스트 → 구매목록으로 저장 (복사 개념)
    const purchaseRes = await createPurchase({
      sourceWishlistId: String(wishlist.id), // 원본 위시리스트 ID (연관삭제 방지용)
      userid: userid.value,
      itemName: wishlist.itemName,
      completionDate: new Date().toISOString().slice(0, 10),
    });

    if (!purchaseRes || !purchaseRes.data) {
      alert('구매 목록 저장에 실패했습니다.');
      return;
    }

    // 2. 사용자 UX를 위해 화면에 먼저 반영
    purchases.value.push(purchaseRes.data);

    // 선택 초기화
    selectedWishlistId.value = '';

    // 자연스럽게 보이도록 약간 딜레이
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. 기존 위시리스트 삭제
    await deleteWishlist(wishlist.id);

    // 4. 화면에서도 위시리스트 제거
    wishlists.value = wishlists.value.filter(
      (item) => String(item.id) !== String(wishlist.id),
    );
  } catch (error) {
    console.error('구매 처리 중 오류:', error);
    alert('구매 처리 중 오류가 발생했습니다.');
  }
};
</script>

<template>
  <section class="wishlist-page">
    <div class="page-head">
      <div>
        <p class="page-subtitle">Saving Goal</p>
        <h1 class="page-title">위시리스트</h1>
      </div>
    </div>

    <div v-if="isLoading" class="state-box">불러오는 중...</div>

    <div v-else class="page-layout">
      <section class="wishlist-section">
        <div class="wishlist-grid">
          <article
            v-for="item in activeWishlists"
            :key="item.id"
            class="wishlist-card"
            :class="{
              selected: String(selectedWishlistId) === String(item.id),
            }"
          >
            <div class="card-top">
              <label class="radio-wrap">
                <input
                  v-model="selectedWishlistId"
                  type="radio"
                  name="wishlistSelect"
                  :value="String(item.id)"
                />
                <span>저금통</span>
              </label>
            </div>

            <h3 class="item-name">{{ item.itemName }}</h3>

            <div class="progress-wrap">
              <div
                class="progress-circle"
                :style="getCircleStyle(item.savedAmount, item.targetPrice)"
              >
                <div class="progress-inner">
                  {{ getProgress(item.savedAmount, item.targetPrice) }}%
                </div>
              </div>
            </div>

            <div class="info-box">
              D-{{ getDday(item.targetDate) }} / 하루
              {{
                getDailyAmount(
                  item.targetPrice,
                  item.savedAmount,
                  item.targetDate,
                ).toLocaleString()
              }}원 저금
            </div>

            <button class="action-btn primary" @click="addMoney(item)">
              돈 넣기
            </button>
          </article>

          <div v-if="!activeWishlists.length" class="empty-card">
            등록된 위시리스트가 없습니다.
          </div>
        </div>
      </section>

      <section class="right-section">
        <section class="panel-card input-panel">
          <div class="panel-badge">상품 정보 입력</div>
          <label class="field-label">상품</label>
          <input
            v-model="form.itemName"
            type="text"
            class="field-input"
            placeholder="상품명을 입력하세요"
          />
          <label class="field-label">가격</label>
          <input
            :value="form.targetPrice"
            type="text"
            inputmode="numeric"
            class="field-input"
            placeholder="가격을 입력하세요"
            @input="form.targetPrice = onlyNumber($event.target.value)"
          />
          <label class="field-label">목표 날짜</label>
          <input
            v-model="form.targetDate"
            type="date"
            class="field-input"
            :min="today"
          />
          <button class="action-btn primary full" @click="addWishlist">
            위시리스트 추가
          </button>
        </section>

        <div class="bottom-panels">
          <section class="panel-card purchase-action-panel">
            <div class="select-card">
              <h3 class="select-title">위시리스트 선택</h3>
              <select
                v-model="selectedWishlistId"
                class="field-input select-input"
              >
                <option value="">위시리스트 목록</option>
                <option
                  v-for="item in activeWishlists"
                  :key="item.id"
                  :value="String(item.id)"
                >
                  {{ item.itemName }}
                </option>
              </select>
            </div>
            <button
              class="action-btn primary full"
              @click="removeSelectedWishlist"
            >
              선택 삭제
            </button>
            <button class="action-btn secondary full" @click="completePurchase">
              구매 완료
            </button>
          </section>

          <section class="panel-card purchase-list-panel">
            <div class="panel-badge list-badge">구매 성공 목록</div>
            <ul v-if="purchaseList.length" class="purchase-list">
              <li
                v-for="purchase in purchaseList"
                :key="purchase.id"
                class="purchase-item"
              >
                <div class="purchase-name">{{ purchase.itemName }}</div>
                <div class="purchase-date">{{ purchase.completionDate }}</div>
              </li>
            </ul>
            <div v-else class="empty-purchase">
              구매 완료된 항목이 없습니다.
            </div>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.wishlist-page {
  width: 100%;
  padding-top: 8px;
  box-sizing: border-box;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-subtitle {
  margin: 0 0 6px;
  font-size: 13px;
  color: #8a8f98;
}

.page-title {
  margin: 0;
  font-size: clamp(
    24px,
    4vw,
    32px
  ); /* 화면 크기에 따라 폰트 사이즈 유동적 조절 */
  font-weight: 800;
  color: #222;
}

.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(620px, 860px);
  gap: 24px;
  align-items: start;
}

.wishlist-section {
  min-width: 0;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 320px));
  gap: 20px;
  align-items: start;
}

.wishlist-card {
  width: 100%;
  max-width: 320px;
}

.wishlist-card,
.panel-card,
.empty-card {
  background: #fff;
  border: 1px solid #e7eef5;
  border-radius: 22px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
}

.wishlist-card {
  padding: 22px 22px 24px;
  transition: all 0.2s ease;
}

.wishlist-card.selected {
  border-color: #73beff;
  box-shadow: 0 8px 20px rgba(115, 190, 255, 0.18);
}

.card-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
}

.radio-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #90a4b2;
  font-size: 12px;
  font-weight: 600;
}

.item-name {
  margin: 0 0 18px;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 800;
  color: #222;
  text-align: center;
  word-break: keep-all;
}

.progress-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.progress-circle {
  width: clamp(108px, 20vw, 128px);
  height: clamp(108px, 20vw, 128px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.progress-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 800;
  color: #222;
}

.info-box {
  width: 100%;
  background: #edf8ff;
  color: #5b93ab;
  border-radius: 12px;
  padding: 13px 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.5;
  box-sizing: border-box;
}

.right-section {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  grid-template-rows: auto 1fr;
  gap: 20px;
  min-width: 0;
  align-items: stretch;
}

.panel-card {
  padding: 20px;
  height: auto;
}

.input-panel {
  grid-column: 1;
  grid-row: 1;
  padding: 18px 18px 20px;
  min-height: auto;
  height: auto;
}

.bottom-panels {
  display: contents;
}

.purchase-action-panel {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 360px;
  padding: 26px;
}

.purchase-list-panel {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 26px;
}

.panel-badge {
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  padding: 10px 16px;
  background: #dff1ff;
  color: #6ca7d6;
  font-size: clamp(20px, 3vw, 22px);
  font-weight: 800;
  border-radius: 12px;
  margin-bottom: 20px;
  white-space: nowrap;
}

.list-badge {
  white-space: nowrap;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #222;
}

.field-input {
  width: 100%;
  padding: 13px 14px;
  margin-bottom: 12px;
  border: 1px solid #b8dbf6;
  border-radius: 12px;
  outline: none;
  background: #fcfeff;
  font-size: 14px;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #73beff;
  box-shadow: 0 0 0 3px rgba(115, 190, 255, 0.12);
}

.select-card {
  border: 1px solid #b8dbf6;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 18px;
}

.select-title {
  margin: 0 0 14px;
  font-size: clamp(20px, 3vw, 24px);
  font-weight: 800;
  color: #222;
  text-align: center;
  white-space: nowrap;
}

.select-input {
  height: 52px;
  font-size: 16px;
  margin-bottom: 0;
}

.action-btn {
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #73beff;
  color: #fff;
}

.action-btn.secondary {
  background: #dff1ff;
  color: #4f8aa3;
}

.action-btn.full {
  width: 100%;
  margin-top: 10px;
}

.wishlist-card .action-btn.primary {
  width: 100%;
  min-height: 68px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  align-self: stretch;
}

.purchase-list {
  list-style: none;
  padding: 0 4px 0 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  max-height: 100%;
}

.purchase-list::-webkit-scrollbar {
  width: 8px;
}

.purchase-list::-webkit-scrollbar-thumb {
  background: #c7e7f7;
  border-radius: 10px;
}

.purchase-list::-webkit-scrollbar-track {
  background: transparent;
}

.purchase-item {
  padding: 14px 12px;
  border-radius: 12px;
  background: #f7fbff;
  border: 1px solid #e2eef9;
  margin-bottom: 12px;
}

.purchase-name {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.purchase-date {
  font-size: 13px;
  color: #6d7f8b;
}

.empty-card,
.empty-purchase,
.state-box {
  padding: 40px 20px;
  text-align: center;
  color: #7c8a96;
  font-weight: 600;
}

.empty-purchase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1600px) {
  .page-layout {
    grid-template-columns: minmax(0, 1fr) minmax(560px, 760px);
  }
}

@media (max-width: 1360px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .wishlist-card {
    max-width: none;
  }

  .right-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .input-panel {
    grid-column: 1;
    grid-row: 1;
  }

  .purchase-action-panel {
    grid-column: 1;
    grid-row: 2;
    min-height: auto;
  }

  .purchase-list-panel {
    grid-column: 1;
    grid-row: 3;
    min-height: auto;
  }

  .panel-badge,
  .select-title {
    white-space: normal;
  }

  .purchase-list {
    max-height: 280px;
  }
}

@media (max-width: 900px) {
  .wishlist-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .purchase-action-panel,
  .purchase-list-panel {
    padding: 22px;
  }

  .select-card {
    padding: 20px;
  }

  .action-btn {
    font-size: 15px;
  }

  .wishlist-card .action-btn.primary {
    min-height: 60px;
  }
}

@media (max-width: 640px) {
  .wishlist-page {
    padding-top: 4px;
  }

  .page-head {
    margin-bottom: 18px;
  }

  .page-layout {
    gap: 18px;
  }

  .right-section {
    gap: 16px;
  }

  .wishlist-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .wishlist-card,
  .panel-card,
  .empty-card {
    border-radius: 18px;
  }

  .wishlist-card,
  .panel-card {
    padding: 18px;
  }

  .input-panel,
  .purchase-action-panel,
  .purchase-list-panel {
    padding: 18px;
  }

  .select-card {
    padding: 18px;
  }

  .action-btn {
    padding: 14px;
    font-size: 14px;
  }

  .field-input,
  .select-input {
    font-size: 14px;
  }

  .item-name {
    font-size: 22px;
  }

  .panel-badge {
    font-size: 20px;
  }

  .purchase-list {
    max-height: 220px;
  }

  .wishlist-card .action-btn.primary {
    min-height: 56px;
  }
}
</style>
