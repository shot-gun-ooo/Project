import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url"; // 경로 처리를 위한 모듈 추가

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // [지침 반영] @ 기호를 src 폴더의 절대 경로로 연결합니다
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});