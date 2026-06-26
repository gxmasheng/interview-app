import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import {
  Users,
  CreditCard,
  ShoppingCart,
  FileText,
  TrendingUp,
  Calendar,
  ChartBarBig
} from 'lucide-react-taro'

interface DashboardData {
  totalUsers: number
  paidMembers: number
  pendingOrders: number
  totalQuestions: number
  todayAnswers: number
  todayRevenue: number
  weeklyTrend: { date: string; answers: number }[]
  typeStats: { type: string; count: number; avgScore: number }[]
}

const MOCK_DATA: DashboardData = {
  totalUsers: 156,
  paidMembers: 48,
  pendingOrders: 23,
  totalQuestions: 10,
  todayAnswers: 89,
  todayRevenue: 1280,
  weeklyTrend: [
    { date: '周一', answers: 45 },
    { date: '周二', answers: 62 },
    { date: '周三', answers: 78 },
    { date: '周四', answers: 56 },
    { date: '周五', answers: 89 },
    { date: '周六', answers: 120 },
    { date: '周日', answers: 95 },
  ],
  typeStats: [
    { type: '综合分析', count: 156, avgScore: 72.5 },
    { type: '组织协调', count: 128, avgScore: 68.3 },
    { type: '人际沟通', count: 98, avgScore: 75.2 },
    { type: '应急应变', count: 112, avgScore: 70.8 },
  ]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA)

  useEffect(() => {
    // 加载数据
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/dashboard',
        method: 'GET'
      })
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (error) {
      console.log('使用模拟数据')
    }
  }

  return (
    <View className="p-6">
      {/* 核心指标 */}
      <View className="grid grid-cols-4 gap-4 mb-6">
        <View className="bg-white rounded-lg shadow p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="block text-sm text-gray-500">总用户数</Text>
              <Text className="block text-2xl font-bold text-gray-800">{data.totalUsers}</Text>
              <View className="flex items-center mt-1">
                <TrendingUp size={14} color="#22c55e" />
                <Text className="block text-xs text-green-500 ml-1">+12% 本周</Text>
              </View>
            </View>
            <Users size={32} color="#3b82f6" />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="block text-sm text-gray-500">付费会员</Text>
              <Text className="block text-2xl font-bold text-gray-800">{data.paidMembers}</Text>
              <View className="flex items-center mt-1">
                <TrendingUp size={14} color="#22c55e" />
                <Text className="block text-xs text-green-500 ml-1">+8% 本周</Text>
              </View>
            </View>
            <CreditCard size={32} color="#22c55e" />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="block text-sm text-gray-500">待处理订单</Text>
              <Text className="block text-2xl font-bold text-orange-500">{data.pendingOrders}</Text>
              <Text className="block text-xs text-gray-400 mt-1">需及时处理</Text>
            </View>
            <ShoppingCart size={32} color="#f97316" />
          </View>
        </View>

        <View className="bg-white rounded-lg shadow p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="block text-sm text-gray-500">题库题目</Text>
              <Text className="block text-2xl font-bold text-gray-800">{data.totalQuestions}</Text>
              <Text className="block text-xs text-gray-400 mt-1">四大题型</Text>
            </View>
            <FileText size={32} color="#8b5cf6" />
          </View>
        </View>
      </View>

      {/* 今日数据 */}
      <View className="bg-white rounded-lg shadow p-4 mb-6">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-lg font-bold text-gray-800">今日数据</Text>
          <View className="flex items-center">
            <Calendar size={16} color="#6b7280" />
            <Text className="block text-sm text-gray-500 ml-1">今日</Text>
          </View>
        </View>
        <View className="grid grid-cols-2 gap-4">
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="block text-sm text-gray-500">答题次数</Text>
            <Text className="block text-xl font-bold text-blue-600">{data.todayAnswers}</Text>
          </View>
          <View className="bg-green-50 rounded-lg p-4">
            <Text className="block text-sm text-gray-500">今日收入</Text>
            <Text className="block text-xl font-bold text-green-600">{data.todayRevenue}元</Text>
          </View>
        </View>
      </View>

      {/* 周答题趋势 */}
      <View className="bg-white rounded-lg shadow p-4 mb-6">
        <Text className="block text-lg font-bold text-gray-800 mb-4">本周答题趋势</Text>
        <View className="flex items-end justify-between h-32 px-2">
          {data.weeklyTrend.map((item, idx) => {
            const max = Math.max(...data.weeklyTrend.map(d => d.answers))
            const height = (item.answers / max) * 100
            return (
              <View key={idx} className="flex flex-col items-center" style={{ width: '14%' }}>
                <View
                  className="bg-blue-500 rounded-t transition-all"
                  style={{ height: `${height}%`, minHeight: '8px' }}
                />
                <Text className="block text-xs text-gray-500 mt-2">{item.date}</Text>
                <Text className="block text-xs text-gray-400">{item.answers}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* 题型统计 */}
      <View className="bg-white rounded-lg shadow p-4">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-lg font-bold text-gray-800">题型答题统计</Text>
          <ChartBarBig size={20} color="#6b7280" />
        </View>
        <View className="space-y-3">
          {data.typeStats.map((item, idx) => (
            <View key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <View className="flex items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <Text className="block text-sm font-medium">{item.type}</Text>
              </View>
              <View className="flex items-center">
                <Text className="block text-sm text-gray-500 mr-4">{item.count}次</Text>
                <Text className="block text-sm font-bold text-blue-600">{item.avgScore}分</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}