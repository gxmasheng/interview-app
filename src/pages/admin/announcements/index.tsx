import { View, Text } from '@tarojs/components'
import { Plus, Pencil, Trash2 } from 'lucide-react-taro'

export default function AdminAnnouncements() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-xl font-bold">公告管理</Text>
          <View className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded cursor-pointer">
            <Plus size={16} color="#fff" />
            <Text className="block text-sm">发布公告</Text>
          </View>
        </View>

        <View className="space-y-4 mb-6">
          <View className="bg-blue-50 rounded p-4 flex items-center justify-between">
            <View>
              <Text className="block font-medium text-blue-800">系统升级通知</Text>
              <Text className="block text-sm text-gray-500 mt-1">2024-01-15 发布 · 已推送</Text>
            </View>
            <View className="flex items-center gap-2">
              <Pencil size={16} color="#3b82f6" />
              <Trash2 size={16} color="#ef4444" />
            </View>
          </View>
          
          <View className="bg-gray-50 rounded p-4 flex items-center justify-between">
            <View>
              <Text className="block font-medium">新年优惠活动</Text>
              <Text className="block text-sm text-gray-500 mt-1">2024-01-10 发布 · 已推送</Text>
            </View>
            <View className="flex items-center gap-2">
              <Pencil size={16} color="#3b82f6" />
              <Trash2 size={16} color="#ef4444" />
            </View>
          </View>
        </View>

        <View className="border-t pt-4">
          <Text className="block text-lg font-medium mb-4">发布公告（开发中）</Text>
          <Text className="block text-gray-500">公告编辑、定时推送、通知模板等功能正在开发...</Text>
        </View>
      </View>
    </View>
  )
}