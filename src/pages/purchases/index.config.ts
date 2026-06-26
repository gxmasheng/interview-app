export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '购买记录' })
  : { navigationBarTitleText: '购买记录' }