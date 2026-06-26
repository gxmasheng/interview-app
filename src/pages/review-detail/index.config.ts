export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '点评详情' })
  : { navigationBarTitleText: '点评详情' }