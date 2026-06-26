export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '点评管理后台' })
  : { navigationBarTitleText: '点评管理后台' }