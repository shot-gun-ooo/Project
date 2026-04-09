<template>
  <div class="mypage-content">
    <div class="page-header">
      <h1 class="main-title">마이페이지</h1>
      <p class="sub-title">내 정보를 확인하고 관리할 수 있습니다.</p>
    </div>

    <div class="mypage-grid">
      <section class="profile-card">
        <div class="avatar-circle">
          <img
            v-if="userDetail.profileImage"
            :src="userDetail.profileImage"
            alt="Profile" />
          <span v-else>👤</span>
        </div>
        <h2 class="user-name">{{ userDetail.name }}</h2>
        <p class="user-email">{{ userDetail.email }}</p>

        <button class="btn-withdraw" @click="handleDeleteAccount">
          탈퇴하기
        </button>
      </section>

      <section class="info-form-card">
        <h3 class="card-title">계정 정보</h3>

        <div class="form-group">
          <label>이름</label>
          <input type="text" v-model="userDetail.name" />
        </div>

        <div class="form-group">
          <label>이메일</label>
          <!-- 이메일은 수정하지 못하도록 설정. -->
          <input type="email" v-model="userDetail.email" :disabled="true" />
        </div>

        <div class="form-group">
          <label>비밀번호</label>
          <input type="password" v-model="userDetail.password" />
        </div>

        <div class="form-group">
          <label>비밀번호 확인</label>
          <input type="password" v-model="passwordConfirm" />
          <!-- 비밀번호와 비밀번호 확인의 값이 같다면 밑에 글씨가 표시되지 않음. -->
          <p
            v-if="userDetail.password !== passwordConfirm"
            style="color: red; font-size: 12px">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <div class="form-actions">
          <!-- 취소 버튼을 눌렀을 때 이전 페이지로 돌아감. -->
          <button class="btn-cancel" @click="router.back()">취소</button>
          <button class="btn-submit" @click="handleUpdate">수정하기</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { getUserInfo, logoutProcess } from '@/utils/authutil';

const router = useRouter();

const passwordConfirm = ref('');
const userDetail = ref({
  id: '',
  userid: '',
  name: '',
  email: '',
  password: '',
  profileImage: null,
});

// 1. 초기 데이터 로드
const fetchUserInfo = async () => {
  const userInfo = getUserInfo();
  if (userInfo.authenticated && userInfo.id) {
    try {
      const response = await axios.get(`/api/users/${userInfo.id}`);
      if (response) {
        userDetail.value = response.data;
      }
    } catch (error) {
      alert(error);
    }
  } else {
    // 로그인 안 되어 있으면 튕겨내기
    router.push({ name: 'users/login' });
  }
};

onMounted(() => fetchUserInfo());

// 2. 정보 수정 함수
const handleUpdate = async () => {
  // 비밀번호와 비밀번호 확인 값이 일치하는지 확인
  if (userDetail.value.password !== passwordConfirm.value) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }
  // 일치한다면 수정
  try {
    await axios.patch(`/api/users/${userDetail.value.id}`, {
      name: userDetail.value.name,
      email: userDetail.value.email,
      password: userDetail.value.password,
    });
    alert('성공적으로 수정되었습니다!');
  } catch (error) {
    alert('수정 중 오류가 발생했습니다.');
  }
};

// 3. 탈퇴 함수
const handleDeleteAccount = async () => {
  if (confirm('정말로 탈퇴하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) {
    try {
      await axios.delete(`/api/users/${userDetail.value.id}`);
      alert('탈퇴되었습니다. 이용해주셔서 감사합니다.');
      logoutProcess(() => {
        router.push({ name: 'users/login' });
        window.location.reload();
      });
    } catch (error) {
      alert('탈퇴 처리 중 오류가 발생했습니다.');
    }
  }
};
</script>

<style scoped>
.mypage-content {
  padding: 40px;
  background-color: #fcfcfc;
  min-height: calc(100vh - 80px); /* 헤더 높이 제외 */
}

.page-header {
  margin-bottom: 30px;
}

.main-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 14px;
  color: #888;
}

.mypage-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  max-width: 1000px;
}

/* 카드 공통 스타일 */
.profile-card,
.info-form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

/* 왼쪽 프로필 섹션 */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  margin-bottom: 20px;
  overflow: hidden;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.user-email {
  font-size: 14px;
  color: #666;
  margin-bottom: 40px;
}

.btn-withdraw {
  border: 1px solid #ffcccc;
  background: white;
  color: #ff5c5c;
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
}

/* 오른쪽 폼 섹션 */
.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.btn-cancel {
  background: #9be0ff; /* 시안의 하늘색 버튼 */
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-submit {
  background: #9be0ff;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.8;
}

.btn-submit:hover {
  opacity: 1;
}

@media (max-width: 900px) {
  .mypage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
