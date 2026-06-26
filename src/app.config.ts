export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/questions/index',
    'pages/records/index',
    'pages/profile/index',
    'pages/answer/index',
    'pages/result/index',
    'pages/feedback/index',
    'pages/report/index',
    'pages/guide/index',
    'pages/member/index',
    'pages/simulate/index',
    'pages/history/index',
    'pages/review/index',
    'pages/review-detail/index',
    'pages/admin-review/index',
    'pages/purchases/index',
    'pages/expenses/index',
    'pages/admin/index',
    'pages/admin/dashboard/index',
    'pages/admin/questions/index',
    'pages/admin/users/index',
    'pages/admin/orders/index',
    'pages/admin/teachers/index',
    'pages/admin/statistics/index',
    'pages/admin/guides/index',
    'pages/admin/announcements/index',
    'pages/admin/settings/index',
    'pages/activate/index',
    'pages/admin/access-codes/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '面试训练',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/house.png',
        selectedIconPath: './assets/tabbar/house-active.png',
      },
      {
        pagePath: 'pages/questions/index',
        text: '题库',
        iconPath: './assets/tabbar/file-text.png',
        selectedIconPath: './assets/tabbar/file-text-active.png',
      },
      {
        pagePath: 'pages/records/index',
        text: '记录',
        iconPath: './assets/tabbar/history.png',
        selectedIconPath: './assets/tabbar/history-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png',
      }
    ]
  }
})