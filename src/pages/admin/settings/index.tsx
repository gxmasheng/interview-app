import { View, Text } from '@tarojs/components'
import { Clock, CreditCard, Bell, Save } from 'lucide-react-taro'

export default function AdminSettings() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <Text className="block text-xl font-bold mb-6">系统设置</Text>
        
        {/* 交付时效设置 */}
        <View className="mb-6 border-b pb-4">
          <View className="flex items-center mb-4">
            <Clock size={20} color="#3b82f6" />
            <Text className="block ml-2 font-medium">交付时效设置</Text>
          </View>
          <View className="grid grid-cols-3 gap-4">
            {['12小时', '24小时', '48小时'].map((time) => (
              <View key={time} className="bg-gray-50 rounded p-3 text-center cursor-pointer hover:bg-blue-50">
                <Text className="block text-sm">{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 费用标准设置 */}
        <View className="mb-6 border-b pb-4">
          <View className="flex items-center mb-4">
            <CreditCard size={20} color="#22c55e" />
            <Text className="block ml-2 font-medium">费用标准设置</Text>
          </View>
          <View className="space-y-3">
            <View className="flex items-center justify-between bg-gray-50 rounded p-3">
              <Text className="block text-sm">月卡价格</Text>
              <View className="flex items-center">
                <input type="text" className="bg-transparent w-16 text-right" value="29.9" />
                <Text className="block text-sm ml-1">元</Text>
              </View>
            </View>
            <View className="flex items-center justify-between bg-gray-50 rounded p-3">
              <Text className="block text-sm">季卡价格</Text>
              <View className="flex items-center">
                <input type="text" className="bg-transparent w-16 text-right" value="59.9" />
                <Text className="block text-sm ml-1">元</Text>
              </View>
            </View>
            <View className="flex items-center justify-between bg-gray-50 rounded p-3">
              <Text className="block text-sm">年卡价格</Text>
              <View className="flex items-center">
                <input type="text" className="bg-transparent w-16 text-right" value="199.9" />
                <Text className="block text-sm ml-1">元</Text>
              </View>
            </View>
            <View className="flex items-center justify-between bg-gray-50 rounded p-3">
              <Text className="block text-sm">单次点评价格</Text>
              <View className="flex items-center">
                <input type="text" className="bg-transparent w-16 text-right" value="39" />
                <Text className="block text-sm ml-1">元</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 通知模板设置 */}
        <View className="mb-6">
          <View className="flex items-center mb-4">
            <Bell size={20} color="#f97316" />
            <Text className="block ml-2 font-medium">通知模板设置</Text>
          </View>
          <View className="bg-gray-50 rounded p-3">
            <Text className="block text-sm mb-2">点评完成通知模板：</Text>
            <textarea className="w-full bg-white border rounded p-2 text-sm" rows={3}>
              您的人工点评已完成，请登录小程序查看详细点评内容。
            </textarea>
          </View>
        </View>

        {/* 保存按钮 */}
        <View className="flex justify-end">
          <View className="flex items-center bg-blue-500 text-white px-6 py-3 rounded cursor-pointer">
            <Save size={18} color="#fff" />
            <Text className="block ml-2">保存设置</Text>
          </View>
        </View>
      </View>
    </View>
  )
}