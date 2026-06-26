export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '模拟历史' })
  : { navigationBarTitleText: '模拟历史' }