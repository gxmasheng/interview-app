import { View, Text } from '@tarojs/components'
import { ShoppingCart, Clock, CircleCheck, TriangleAlert } from 'lucide-react-taro'

export default function AdminOrders() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <Text className="block text-xl font-bold mb-4">订单管理</Text>
        
        <View className="grid grid-cols-4 gap-4 mb-6">
          <View className="bg-orange-50 rounded p-4">
            <Clock size={24} color="#f97316" />
            <Text className="block mt-2 text-lg font-bold text-orange-600">23</Text>
            <Text className="block text-sm text-gray-500">待处理</Text>
          </View>
          <View className="bg-blue-50 rounded p-4">
            <ShoppingCart size={24} color="#3b82f6" />
            <Text className="block mt-2 text-lg font-bold text-blue-600">15</Text>
            <Text className="block text-sm text-gray-500">进行中</Text>
          </View>
          <View className="bg-green-50 rounded p-4">
            <CircleCheck size={24} color="#22c55e" />
            <Text className="block mt-2 text-lg font-bold text-green-600">89</Text>
            <Text className="block text-sm text-gray-500">已完成</Text>
          </View>
          <View className="bg-red-50 rounded p-4">
            <TriangleAlert size={24} color="#ef4444" />
            <Text className="block mt-2 text-lg font-bold text-red-600">5</Text>
            <Text className="block text-sm text-gray-500">已超时</Text>
          </View>
        </View>

        <View className="border-t pt-4">
          <Text className="block text-lg font-medium mb-4">订单列表（开发中）</Text>
          <Text className="block text-gray-500">订单列表、状态追踪、超时处理等功能正在开发...</Text>
        </View>
      </View>
    </View>
  )
}