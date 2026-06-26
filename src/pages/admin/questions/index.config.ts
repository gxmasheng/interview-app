export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '题库管理' })
  : { navigationBarTitleText: '题库管理' }