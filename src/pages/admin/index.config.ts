export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '后台管理' })
  : { navigationBarTitleText: '后台管理' }