export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '人工点评' })
  : { navigationBarTitleText: '人工点评' }