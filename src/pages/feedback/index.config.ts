export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '专业点评' })
  : { navigationBarTitleText: '专业点评' }