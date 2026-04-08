// stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, fetchUserById, saveProfileImagePath } from '@/utils/authUtil.js'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {

  const profileImagePath = ref(null)

  // 마이페이지 진입 시 db.json에서 경로 불러오기
  const loadProfileImage = async () => {
    const userInfo = getUserInfo()
    if (!userInfo.authenticated) return

    const user = await fetchUserById(userInfo.id)
    if (user) {
      profileImagePath.value = user.profileImage || null
    }
  }

  // 파일 업로드 흐름:
  // 1. FormData에 file + userid 담기
  // 2. POST /upload → server.js가 파일 저장 후 경로 반환
  // 3. 반환된 경로를 db.json에 PATCH로 저장
  // 4. 화면에 즉시 반영
  const uploadProfileImage = async (file) => {
    const userInfo = getUserInfo()
    if (!userInfo.authenticated) return

    const formData = new FormData()
    formData.append('userid', userInfo.userid)  // userid 먼저
    formData.append('file', file)               // file 나중에

    const response = await axios.post('/upload', formData)
    const imagePath = response.data.imagePath

    // db.json에 경로 저장
    await saveProfileImagePath(userInfo.id, imagePath)

    // 화면 즉시 반영
    profileImagePath.value = imagePath

    return imagePath
  }

  return {
    profileImagePath,
    loadProfileImage,
    uploadProfileImage,
  }
})