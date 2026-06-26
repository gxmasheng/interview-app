export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '备考指南管理' })
  : { navigationBarTitleText: '备考指南管理' }