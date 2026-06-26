export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '公告管理' })
  : { navigationBarTitleText: '公告管理' }