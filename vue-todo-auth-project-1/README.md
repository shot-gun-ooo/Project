# Vue Todo Auth Project

## 실행 방법

### 1. 패키지 설치
```
npm install
```

### 2. 터미널 두 개 실행

터미널 1 - json-server (포트 3000)
```
npx json-server --watch db.json --port 3000 --static ./public
```

터미널 2 - Vue 앱 (포트 5173)
```
npm run dev
```

### 3. 테스트 계정
- user1 / 1234
- admin / 1234

## 프로필 이미지 저장 위치
`public/uploads/profile/` 폴더에 이미지 파일을 직접 넣으면
json-server가 자동으로 서빙합니다.

파일명 형식: `userid_타임스탬프.확장자`
예시: `user1_1710000000000.jpg`

## 필요한 패키지
vue-router : 라우팅
pinia : 상태관리
axios : HTTP 요청
bootstrap : UI 스타일
@fortawesome/fontawesome-free : 아이콘
vue-csspin : 로딩 스피너
chart.js, vue-chartjs : 차트
express : 업로드 서버
multer : 파일 업로드 처리
cors : 포트 간 요청 허용
json-server : mock API 서버

npm install pinia
npm install axios
npm install bootstrap @fortawesome/fontawesome-free vue-csspin
npm install chart.js  vue-chartjs
npm install express multer cors
