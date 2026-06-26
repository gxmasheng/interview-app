export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '激活会员' })
  : { navigationBarTitleText: '激活会员' }