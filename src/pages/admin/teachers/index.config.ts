export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '老师管理' })
  : { navigationBarTitleText: '老师管理' }