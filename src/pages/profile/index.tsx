import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, TrendingUp, Award, Settings, ShieldCheck, FileText, CreditCard } from 'lucide-react-taro'

const ProfilePage: FC = () => {
  useLoad(() => {
    console.log('个人页面加载完成')
  })

  // 模拟统计数据
  const stats = {
    totalPractice: 45,
    avgScore: 72,
    goodRate: 65,
    weakType: '应急应变',
    weeklyProgress: [
      { week: '第1周', avg: 58 },
      { week: '第2周', avg: 65 },
      { week: '第3周', avg: 72 },
      { week: '第4周', avg: 78 },
    ],
  }

  const typeScores = [
    { type: '综合分析', avg: 16, max: 20 },
    { type: '组织协调', avg: 14, max: 20 },
    { type: '人际沟通', avg: 15, max: 20 },
    { type: '应急应变', avg: 12, max: 20 },
  ]

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 用户信息 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="flex items-center">
            <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <User size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-gray-900">面试学员</Text>
              <Text className="block text-sm text-gray-500">已练习 {stats.totalPractice} 题</Text>
            </View>
            <Award size={24} color="#f59e0b" />
          </View>
        </CardContent>
      </Card>

      {/* 核心数据 */}
      <View className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Text className="block text-2xl font-bold text-blue-600">{stats.avgScore}</Text>
            <Text className="block text-xs text-gray-500 mt-1">平均得分</Text>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Text className="block text-2xl font-bold text-green-600">{stats.goodRate}%</Text>
            <Text className="block text-xs text-gray-500 mt-1">好评率</Text>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Text className="block text-2xl font-bold text-orange-600">{stats.totalPractice}</Text>
            <Text className="block text-xs text-gray-500 mt-1">练习次数</Text>
          </CardContent>
        </Card>
      </View>

      {/* 各题型得分 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp size={18} color="#2563eb" className="mr-2" />
            各题型得分情况
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {typeScores.map((item) => (
            <View key={item.type} className="mb-3">
              <View className="flex items-center justify-between mb-1">
                <Text className="block text-sm text-gray-600">{item.type}</Text>
                <Text className="block text-sm font-medium text-gray-900">{item.avg}/{item.max}分</Text>
              </View>
              <Progress value={(item.avg / item.max) * 100} className="h-2" />
            </View>
          ))}
          <View className="mt-3 pt-2 border-t border-gray-100">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              薄弱环节：{stats.weakType}
            </Badge>
          </View>
        </CardContent>
      </Card>

      {/* 功能菜单 */}
      <Card className="mb-4">
        <CardContent className="p-2">
          <View 
            className="flex items-center justify-between p-3 border-b border-gray-100"
            onClick={() => Taro.navigateTo({ url: '/pages/purchases/index' })}
          >
            <View className="flex items-center">
              <CreditCard size={18} color="#2563eb" className="mr-2" />
              <Text className="block text-sm text-gray-900">购买记录</Text>
            </View>
            <Text className="block text-xs text-gray-400">查看</Text>
          </View>
          <View 
            className="flex items-center justify-between p-3 border-b border-gray-100"
            onClick={() => Taro.navigateTo({ url: '/pages/expenses/index' })}
          >
            <View className="flex items-center">
              <FileText size={18} color="#2563eb" className="mr-2" />
              <Text className="block text-sm text-gray-900">消费明细</Text>
            </View>
            <Text className="block text-xs text-gray-400">查看</Text>
          </View>

          <View className="flex items-center justify-between p-3 border-b border-gray-100">
            <View className="flex items-center">
              <TrendingUp size={18} color="#2563eb" className="mr-2" />
              <Text className="block text-sm text-gray-900">训练报告</Text>
            </View>
            <Text className="block text-xs text-gray-400">查看详情</Text>
          </View>
          <View className="flex items-center justify-between p-3 border-b border-gray-100">
            <View className="flex items-center">
              <Settings size={18} color="#6b7280" className="mr-2" />
              <Text className="block text-sm text-gray-900">设置</Text>
            </View>
            <Text className="block text-xs text-gray-400">管理偏好</Text>
          </View>
          {/* 后台管理入口 */}
          <View 
            className="flex items-center justify-between p-3 bg-slate-800 rounded-b-lg"
            onClick={() => Taro.navigateTo({ url: '/pages/admin/index' })}
          >
            <View className="flex items-center">
              <ShieldCheck size={18} color="#fff" className="mr-2" />
              <Text className="block text-sm text-white">后台管理</Text>
            </View>
            <Text className="block text-xs text-gray-300">管理员入口</Text>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}

export default ProfilePage