export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '消费明细' })
  : { navigationBarTitleText: '消费明细' }