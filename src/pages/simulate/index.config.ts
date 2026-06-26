export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'AI全真模拟面试' })
  : { navigationBarTitleText: 'AI全真模拟面试' }