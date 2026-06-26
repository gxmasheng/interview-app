export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '评分结果' })
  : { navigationBarTitleText: '评分结果' }