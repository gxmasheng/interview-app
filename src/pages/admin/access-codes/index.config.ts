export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '访问码管理' })
  : { navigationBarTitleText: '访问码管理' }