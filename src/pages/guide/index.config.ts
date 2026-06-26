export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '备考指南',
    })
  : { navigationBarTitleText: '备考指南' }