import { View, Text } from '@tarojs/components'

const GUIDE_SECTIONS = [
  { key: 'process', title: '面试流程', icon: '📋' },
  { key: 'scoring', title: '评分标准', icon: '📊' },
  { key: 'tips', title: '答题技巧', icon: '💡' },
  { key: 'notice', title: '考场注意事项', icon: '⚠️' },
  { key: 'materials', title: '素材库', icon: '📚' },
  { key: 'cases', title: '案例库', icon: '📖' },
]

export default function AdminGuides() {
  return (
    <View className="p-6">
      <View className="bg-white rounded-lg shadow p-6">
        <Text className="block text-xl font-bold mb-4">备考指南管理</Text>
        
        <View className="grid grid-cols-3 gap-4 mb-6">
          {GUIDE_SECTIONS.map((section) => (
            <View
              key={section.key}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100"
            >
              <Text className="block text-2xl mb-2">{section.icon}</Text>
              <Text className="block font-medium">{section.title}</Text>
              <Text className="block text-sm text-gray-500 mt-1">点击编辑内容</Text>
            </View>
          ))}
        </View>

        <View className="border-t pt-4">
          <Text className="block text-lg font-medium mb-4">内容编辑器（开发中）</Text>
          <Text className="block text-gray-500">富文本编辑、素材上传、会员预览限制设置等功能正在开发...</Text>
        </View>
      </View>
    </View>
  )
}