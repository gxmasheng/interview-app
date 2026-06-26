import { View, Text } from '@tarojs/components'
import { TrendingUp, DollarSign } from 'lucide-react-taro'

export default function AdminStatistics() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <Text className="block text-xl font-bold mb-4">数据统计</Text>
        
        <View className="grid grid-cols-2 gap-6 mb-6">
          <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <TrendingUp size={32} color="#fff" />
            <Text className="block mt-2 text-xl font-bold">用户增长趋势</Text>
            <Text className="block text-sm opacity-80">本周新增用户 23人</Text>
          </View>
          <View className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <DollarSign size={32} color="#fff" />
            <Text className="block mt-2 text-xl font-bold">收入统计</Text>
            <Text className="block text-sm opacity-80">本月收入 2,890元</Text>
          </View>
        </View>

        <View className="border-t pt-4">
          <Text className="block text-lg font-medium mb-4">详细报表（开发中）</Text>
          <Text className="block text-gray-500">题型正确率、付费转化、用户活跃度等图表正在开发...</Text>
        </View>
      </View>
    </View>
  )
}