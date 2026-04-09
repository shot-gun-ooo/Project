<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  getWishlists,
  getWishlistById,
  createWishlist,
  deleteWishlist,
  updateSavedAmount,
} from '@/api/wishlist.js';
import { getPurchases, createPurchase } from '@/api/purchase.js';

// --- 상태 관리 (State) ---
const userid = '1'; // 현재 로그인한 사용자 ID (하드코딩)
const wishlists = ref([]); // 전체 위시리스트 데이터
const purchases = ref([]); // 구매 완료 목록 데이터
const selectedWishlistId = ref(''); // 라디오 버튼이나 셀렉트 박스에서 선택된 위시리스트 ID
const isLoading = ref(false); // 로딩 상태 제어

// 신규 위시리스트 등록을 위한 입력 폼 데이터
const form = reactive({
  itemName: '',
  targetPrice: '',
  targetDate: '',
});

// --- 계산된 속성 (Computed) ---
// 진행 중인 위시리스트만 필터링 (본인 것 + status가 'proceeding'이거나 없는 경우)
const activeWishlists = computed(() =>
  wishlists.value.filter(
    (item) =>
      String(item.userid) === String(userid) &&
      (item.status === 'proceeding' || !item.status),
  ),
);

// 본인의 구매 완료 내역 필터링
const purchaseList = computed(() =>
  purchases.value.filter((item) => String(item.userid) === String(userid)),
);

// --- 데이터 통신 (API) ---
// 위시리스트 목록 가져오기
const fetchWishlists = async () => {
  const res = await getWishlists();
  wishlists.value = res.data.filter(
    (item) => String(item.userid) === String(userid),
  );
};

// 구매 내역 목록 가져오기
const fetchPurchases = async () => {
  const res = await getPurchases();
  purchases.value = res.data.filter(
    (item) => String(item.userid) === String(userid),
  );
};

// 페이지 초기화 시 전체 데이터 로드
const fetchAll = async () => {
  try {
    isLoading.value = true;
    await fetchWishlists();
    await fetchPurchases();
  } catch (error) {
    console.error('데이터 조회 실패:', error);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

// 마운트 시 실행
onMounted(() => {
  fetchAll();
});

// --- 유틸리티 함수 (Logic) ---
const resetForm = () => {
  form.itemName = '';
  form.targetPrice = '';
  form.targetDate = '';
};

// 저축 진행률 계산 (%)
const getProgress = (savedAmount, targetPrice) => {
  const target = Number(targetPrice);
  const saved = Number(savedAmount);
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((saved / target) * 100));
};

// 남은 날짜(D-Day) 계산
const getDday = (targetDate) => {
  if (!targetDate) return 0;
  const today = new Date();
  const target = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// 남은 금액 계산
const getRemainingAmount = (targetPrice, savedAmount) =>
  Math.max(0, Number(targetPrice) - Number(savedAmount));

// 목표 달성을 위해 하루에 저금해야 할 금액 계산
const getDailyAmount = (targetPrice, savedAmount, targetDate) => {
  const remain = getRemainingAmount(targetPrice, savedAmount);
  const dday = getDday(targetDate);
  if (remain <= 0) return 0;
  if (dday <= 0) return remain;
  return Math.ceil(remain / dday);
};

// 진행률에 따른 원형 프로그레스 바 배경 CSS 생성
const getCircleStyle = (savedAmount, targetPrice) => {
  const progress = getProgress(savedAmount, targetPrice);
  const degree = progress * 3.6; // 100%를 360도로 환산
  return {
    background: `conic-gradient(#73BEFF 0deg ${degree}deg, #DDEFFD ${degree}deg 360deg)`,
  };
};

// --- 액션 함수 (User Interaction) ---
// 새 위시리스트 추가
const addWishlist = async () => {
  if (!form.itemName.trim() || !form.targetPrice || !form.targetDate) {
    alert('상품명, 가격, 목표 날짜를 모두 입력해주세요.');
    return;
  }
  if (Number(form.targetPrice) <= 0) {
    alert('가격은 0보다 커야 합니다.');
    return;
  }
  try {
    await createWishlist({
      userid: String(userid),
      itemName: form.itemName.trim(),
      targetPrice: Number(form.targetPrice),
      savedAmount: 0,
      targetDate: form.targetDate,
      status: 'proceeding',
    });
    resetForm();
    await fetchWishlists();
  } catch (error) {
    console.error('위시리스트 등록 실패:', error);
    alert('위시리스트 등록에 실패했습니다.');
  }
};

// 특정 위시리스트에 금액 추가
const addMoney = async (wishlist) => {
  const input = prompt('추가할 금액을 입력하세요.');
  if (input === null) return;
  const amount = Number(input);
  if (Number.isNaN(amount) || amount <= 0) {
    alert('올바른 금액을 입력해주세요.');
    return;
  }
  try {
    // 현재 금액 + 추가 금액 (목표 금액을 초과할 수 없음)
    const nextSavedAmount = Math.min(
      Number(wishlist.targetPrice),
      Number(wishlist.savedAmount) + amount,
    );
    await updateSavedAmount(wishlist.id, nextSavedAmount);
    await fetchWishlists();
  } catch (error) {
    console.error('돈 넣기 실패:', error);
    alert('돈 넣기에 실패했습니다.');
  }
};

// 선택된 위시리스트 삭제
const removeSelectedWishlist = async () => {
  if (!selectedWishlistId.value) {
    alert('삭제할 위시리스트를 선택해주세요.');
    return;
  }
  const ok = confirm('선택한 위시리스트를 삭제할까요?');
  if (!ok) return;
  try {
    await deleteWishlist(selectedWishlistId.value);
    selectedWishlistId.value = '';
    await fetchWishlists();
  } catch (error) {
    console.error('위시리스트 삭제 실패:', error);
    alert('위시리스트 삭제에 실패했습니다.');
  }
};

// 위시리스트 완료 -> 구매 내역으로 이동
const completePurchase = async () => {
  if (!selectedWishlistId.value) {
    alert('구매 완료할 위시리스트를 선택해주세요.');
    return;
  }
  
  try {
    // 1. 위시리스트 상세 정보 조회
    const wishlistRes = await getWishlistById(selectedWishlistId.value);
    const wishlist = wishlistRes.data;

    const payload = {
      // id는 JSON Server가 자동으로 생성하므로 제외하는 것이 좋습니다.
      wishlistId: String(wishlist.id),
      userid: String(wishlist.userid),
      itemName: wishlist.itemName,
      completionDate: new Date().toISOString().slice(0, 10),
      finalPrice: wishlist.targetPrice,
    };

    // 2. 구매 내역 생성을 "먼저" 수행 (순서 변경)
    const postRes = await createPurchase(payload);
    
    if (postRes.status === 201 || postRes.status === 200) {
      // 3. 생성이 성공했을 때만 위시리스트에서 삭제
      await deleteWishlist(wishlist.id);
      
      selectedWishlistId.value = '';
      // 목록 새로고침
      await fetchWishlists();
      await fetchPurchases();
      alert('구매가 완료되어 목록으로 이동되었습니다!');
    }
  } catch (error) {
    console.error('처리 중 오류 발생:', error);
    alert('구매 처리 중 오류가 발생했습니다. 서버 로그를 확인하세요.');
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
            :class="{ selected: String(selectedWishlistId) === String(item.id) }"
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
              {{ getDailyAmount(item.targetPrice, item.savedAmount, item.targetDate).toLocaleString() }}원 저금
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
          <input v-model="form.itemName" type="text" class="field-input" placeholder="상품명을 입력하세요" />
          <label class="field-label">가격</label>
          <input v-model="form.targetPrice" type="number" class="field-input" placeholder="가격을 입력하세요" />
          <label class="field-label">목표 날짜</label>
          <input v-model="form.targetDate" type="date" class="field-input" />
          <button class="action-btn primary full" @click="addWishlist">
            위시리스트 추가
          </button>
        </section>

        <div class="bottom-panels">
          <section class="panel-card purchase-action-panel">
            <div class="select-card">
              <h3 class="select-title">위시리스트 선택</h3>
              <select v-model="selectedWishlistId" class="field-input select-input">
                <option value="">위시리스트 목록</option>
                <option v-for="item in activeWishlists" :key="item.id" :value="String(item.id)">
                  {{ item.itemName }}
                </option>
              </select>
            </div>
            <button class="action-btn primary full" @click="removeSelectedWishlist">선택 삭제</button>
            <button class="action-btn secondary full" @click="completePurchase">구매 완료</button>
          </section>

          <section class="panel-card purchase-list-panel">
            <div class="panel-badge list-badge">구매 성공 목록</div>
            <ul v-if="purchaseList.length" class="purchase-list">
              <li v-for="purchase in purchaseList" :key="purchase.id" class="purchase-item">
                <div class="purchase-name">{{ purchase.itemName }}</div>
                <div class="purchase-date">{{ purchase.completionDate }}</div>
              </li>
            </ul>
            <div v-else class="empty-purchase">구매 완료된 항목이 없습니다.</div>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* 페이지 전체 레이아웃 */
.wishlist-page {
  width: 100%;
  padding-top: 8px;
  box-sizing: border-box;
}

/* 상단 타이틀 영역 (Saving Goal & 위시리스트) */
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
  font-size: clamp(24px, 4vw, 32px); /* 화면 크기에 따라 폰트 사이즈 유동적 조절 */
  font-weight: 800;
  color: #222;
}

/* 메인 레이아웃: 왼쪽(리스트)과 오른쪽(입력창/정보) 배치 */
.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(620px, 860px);
  gap: 24px;
  align-items: start;
}

/* 위시리스트 카드 그리드 설정 */
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

/* 공통 카드 스타일 (배경, 테두리, 그림자 등) */
.wishlist-card,
.panel-card,
.empty-card {
  background: #fff;
  border: 1px solid #e7eef5;
  border-radius: 22px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
}

/* 개별 위시리스트 카드 내부 스타일 */
.wishlist-card {
  padding: 22px 22px 24px;
  transition: all 0.2s ease;
}

/* 카드 선택 시 강조 효과 (파란색 테두리 및 그림자) */
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

/* 원형 진행률 그래프 영역 */
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

/* D-day 및 하루 저금액 안내 박스 */
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

/* 오른쪽 섹션 (입력창 + 구매관리 + 구매목록) 레이아웃 */
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

/* 위시리스트 추가 입력 폼 패널 */
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

/* 구매 완료/삭제 버튼 패널 */
.purchase-action-panel {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 360px;
  padding: 26px;
}

/* 우측 전체를 차지하는 구매 성공 목록 패널 */
.purchase-list-panel {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 26px;
}

/* 섹션 타이틀 배지 (상품 정보 입력, 구매 성공 목록 등) */
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

/* 입력 필드 및 라벨 스타일 */
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

/* 구매 관리 섹션 내 셀렉트 박스 카드 */
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

/* 공통 버튼 스타일 */
.action-btn {
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
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

/* 위시리스트 카드 안의 '돈 넣기' 버튼 전용 스타일 */
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

/* 구매 완료 목록 스크롤 및 아이템 스타일 */
.purchase-list {
  list-style: none;
  padding: 0 4px 0 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  max-height: 100%;
}

/* 커스텀 스크롤바 디자인 */
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

/* 데이터가 없을 때의 안내 문구 스타일 */
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

/* --- 반응형 레이아웃 처리 (미디어 쿼리) --- */

/* 1. 일반적인 큰 화면 대응 */
@media (max-width: 1600px) {
  .page-layout {
    grid-template-columns: minmax(0, 1fr) minmax(560px, 760px);
  }
}

/* 2. 노트북/작은 모니터: 2열 레이아웃을 1열로 전환 */
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

/* 3. 태블릿 기기 대응 */
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

/* 4. 모바일 기기 대응: 간격 축소 및 폰트 크기 조정 */
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