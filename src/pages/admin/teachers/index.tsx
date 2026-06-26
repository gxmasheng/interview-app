import { View, Text } from '@tarojs/components'
import { GraduationCap, Star, Award, Clock } from 'lucide-react-taro'

export default function AdminTeachers() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <Text className="block text-xl font-bold mb-4">老师管理</Text>
        
        <View className="grid grid-cols-4 gap-4 mb-6">
          <View className="bg-gray-50 rounded p-4">
            <GraduationCap size={24} color="#3b82f6" />
            <Text className="block mt-2 text-lg font-bold">8</Text>
            <Text className="block text-sm text-gray-500">注册老师</Text>
          </View>
          <View className="bg-green-50 rounded p-4">
            <Star size={24} color="#22c55e" />
            <Text className="block mt-2 text-lg font-bold">5</Text>
            <Text className="block text-sm text-gray-500">活跃老师</Text>
          </View>
          <View className="bg-yellow-50 rounded p-4">
            <Award size={24} color="#f59e0b" />
            <Text className="block mt-2 text-lg font-bold">4.8</Text>
            <Text className="block text-sm text-gray-500">平均评分</Text>
          </View>
          <View className="bg-blue-50 rounded p-4">
            <Clock size={24} color="#6366f1" />
            <Text className="block mt-2 text-lg font-bold">24h</Text>
            <Text className="block text-sm text-gray-500">平均响应</Text>
          </View>
        </View>

        <View className="border-t pt-4">
          <Text className="block text-lg font-medium mb-4">老师列表（开发中）</Text>
          <Text className="block text-gray-500">老师入驻、能力评级、工作量统计等功能正在开发...</Text>
        </View>
      </View>
    </View>
  )
}