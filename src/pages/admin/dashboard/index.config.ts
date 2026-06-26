export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '数据概览' })
  : { navigationBarTitleText: '数据概览' }