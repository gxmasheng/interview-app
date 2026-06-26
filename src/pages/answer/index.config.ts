export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '答题' })
  : { navigationBarTitleText: '答题' }