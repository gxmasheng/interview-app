export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '评分报告' })
  : { navigationBarTitleText: '评分报告' }