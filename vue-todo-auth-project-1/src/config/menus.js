
export const homeMenus = [
  {
    title: '내 강의',
    desc: '수강 중인 강의 보기',
    icon: 'fa-solid fa-book',
    iconBoxClass: 'bg-primary-subtle text-primary',
    routeName: 'about',
    roles: ['users']
  },
  {
    title: '사용자 관리',
    desc: '회원 목록 및 권한 관리',
    icon: 'fa-solid fa-users',
    iconBoxClass: 'bg-primary-subtle text-primary',
    routeName: 'admin/users',
    roles: ['admins']
  },
  {
    title: '출석 체크',
    desc: '오늘 출석 확인하기',
    icon: 'fa-solid fa-calendar-check',
    iconBoxClass: 'bg-success-subtle text-success',
    routeName: null,
  },
  {
    title: '할일 목록',
    desc: '오늘 할일 확인하기',
    icon: 'fa-solid fa-clipboard-list',
    iconBoxClass: 'bg-warning-subtle text-warning',
    routeName: 'todos',
  },
  {
    title: '마이페이지',
    desc: '프로필 및 설정',
    icon: 'fa-solid fa-gear',
    iconBoxClass: 'bg-danger-subtle text-danger',
    routeName: 'mypage',
  },
]