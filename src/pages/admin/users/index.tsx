import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { Network } from '@/network'
import { Users, CreditCard, Calendar, Crown, Clock, Search, UserPlus, CircleCheck, CircleAlert } from 'lucide-react-taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// 会员套餐选项
const MEMBER_PLANS = [
  { id: 'monthly', name: '月卡', days: 30, price: 29.9, reviews: 1 },
  { id: 'quarterly', name: '季卡', days: 90, price: 59.9, reviews: 2 },
  { id: 'yearly', name: '年卡', days: 365, price: 199.9, reviews: 6 },
]

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  isMember: boolean
  memberType: string
  memberEndAt: string
  remainingReviews: number
}

// 默认测试用户ID
const DEFAULT_USER_ID = 'wx_test_user_001'

export default function AdminUsers() {
  const [searchUserId] = useState(DEFAULT_USER_ID)
  const [selectedPlan, setSelectedPlan] = useState('quarterly')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // 查询用户信息
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) {
      setErrorMsg('请输入用户ID')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    setUserInfo(null)

    try {
      const res = await Network.request({
        url: `/api/admin/user/${searchUserId.trim()}`,
        method: 'GET',
      })

      if (res.data?.code === 200 && res.data?.data) {
        setUserInfo(res.data.data)
      } else {
        setErrorMsg('用户不存在或查询失败')
      }
    } catch (err) {
      setErrorMsg('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 开通会员
  const handleOpenMember = async () => {
    if (!userInfo) {
      setErrorMsg('请先查询用户')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const plan = MEMBER_PLANS.find(p => p.id === selectedPlan)
      const res = await Network.request({
        url: '/api/admin/open-member',
        method: 'POST',
        data: {
          userId: userInfo.id,
          memberType: selectedPlan,
          days: plan?.days,
          freeReviews: plan?.reviews,
        },
      })

      if (res.data?.code === 200) {
        setSuccessMsg(`成功为用户 ${userInfo.nickname || userInfo.id} 开通${plan?.name}会员！`)
        // 重新查询用户信息
        handleSearchUser()
      } else {
        setErrorMsg(res.data?.msg || '开通失败')
      }
    } catch (err) {
      setErrorMsg('开通失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 统计卡片 */}
      <View className="grid grid-cols-3 gap-3 p-4">
        <View className="bg-white rounded-lg shadow p-4">
          <Users size={20} color="#3b82f6" />
          <Text className="block mt-2 text-lg font-bold text-gray-800">--</Text>
          <Text className="block text-xs text-gray-500">总用户数</Text>
        </View>
        <View className="bg-white rounded-lg shadow p-4">
          <CreditCard size={20} color="#22c55e" />
          <Text className="block mt-2 text-lg font-bold text-gray-800">--</Text>
          <Text className="block text-xs text-gray-500">付费会员</Text>
        </View>
        <View className="bg-white rounded-lg shadow p-4">
          <Calendar size={20} color="#f97316" />
          <Text className="block mt-2 text-lg font-bold text-gray-800">--</Text>
          <Text className="block text-xs text-gray-500">今日活跃</Text>
        </View>
      </View>

      {/* 手动开通会员 */}
      <View className="px-4 mt-2">
        <Card className="shadow">
          <CardHeader>
            <CardTitle>
              <View className="flex items-center">
                <Crown size={18} color="#f97316" />
                <Text className="block ml-2">手动开通会员</Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 提示信息 */}
            <View className="bg-orange-50 rounded-lg p-3 mb-4">
              <View className="flex items-start">
                <CircleAlert size={16} color="#f97316" />
                <Text className="block ml-2 text-xs text-orange-600">
                  用户添加客服微信后，客服在此输入用户ID，选择套餐类型，点击开通即可
                </Text>
              </View>
            </View>

            {/* 搜索用户 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">用户ID</Text>
              <View className="flex flex-row gap-2">
                <View className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                  <Text className="block text-gray-800">
                    {searchUserId || '请输入用户ID（如：wx_123456）'}
                  </Text>
                </View>
                <Button
                  className="bg-blue-500 text-white"
                  onClick={handleSearchUser}
                  disabled={loading}
                >
                  <Search size={16} color="#fff" />
                  <Text className="block ml-1 text-xs">查询</Text>
                </Button>
              </View>
            </View>

            {/* 错误/成功提示 */}
            {errorMsg && (
              <View className="bg-red-50 rounded-lg p-3 mb-4">
                <Text className="block text-xs text-red-600">{errorMsg}</Text>
              </View>
            )}
            {successMsg && (
              <View className="bg-green-50 rounded-lg p-3 mb-4">
                <View className="flex items-center">
                  <CircleCheck size={16} color="#22c55e" />
                  <Text className="block ml-2 text-xs text-green-600">{successMsg}</Text>
                </View>
              </View>
            )}

            {/* 用户信息展示 */}
            {userInfo && (
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <View className="flex flex-row items-center justify-between mb-3">
                  <View className="flex flex-row items-center">
                    <Users size={24} color="#6b7280" />
                    <View className="ml-2">
                      <Text className="block text-sm font-medium text-gray-800">
                        {userInfo.nickname || userInfo.id}
                      </Text>
                      <Text className="block text-xs text-gray-500">ID: {userInfo.id}</Text>
                    </View>
                  </View>
                  {userInfo.isMember ? (
                    <Badge className="bg-green-500 text-white">
                      <Crown size={12} color="#fff" />
                      <Text className="block ml-1 text-xs">{userInfo.memberType}</Text>
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-300 text-gray-600">
                      <Text className="block text-xs">非会员</Text>
                    </Badge>
                  )}
                </View>
                
                {userInfo.isMember && (
                  <View className="flex flex-row items-center justify-between text-xs text-gray-600">
                    <View className="flex items-center">
                      <Clock size={14} color="#6b7280" />
                      <Text className="block ml-1">到期：{userInfo.memberEndAt}</Text>
                    </View>
                    <Text className="block">剩余点评：{userInfo.remainingReviews}次</Text>
                  </View>
                )}
              </View>
            )}

            {/* 选择套餐 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">选择套餐</Text>
              <View className="space-y-2">
                {MEMBER_PLANS.map((plan) => (
                  <View
                    key={plan.id}
                    className={`rounded-lg p-3 border-2 ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex flex-row items-center">
                        <Crown size={16} color={selectedPlan === plan.id ? '#2563eb' : '#6b7280'} />
                        <View className="ml-2">
                          <Text className="block text-sm font-medium text-gray-800">
                            {plan.name}
                          </Text>
                          <Text className="block text-xs text-gray-500">
                            有效期{plan.days}天，赠{plan.reviews}次点评
                          </Text>
                        </View>
                      </View>
                      <Text className="block text-lg font-bold text-blue-600">
                        ¥{plan.price}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 开通按钮 */}
            <Button
              className="w-full bg-orange-500 text-white"
              onClick={handleOpenMember}
              disabled={loading || !userInfo}
            >
              <UserPlus size={16} color="#fff" />
              <Text className="block ml-2 font-medium">
                {loading ? '处理中...' : '立即开通会员'}
              </Text>
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* 操作说明 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-lg shadow p-4">
          <Text className="block text-sm font-medium text-gray-700 mb-2">操作流程说明</Text>
          <View className="space-y-2">
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-blue-600 font-bold">1.</Text>
              <Text className="block ml-1 text-xs text-gray-600">用户添加客服微信，发送「会员开通 + 套餐类型」</Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-blue-600 font-bold">2.</Text>
              <Text className="block ml-1 text-xs text-gray-600">客服确认用户付款后，在此输入用户ID查询</Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-blue-600 font-bold">3.</Text>
              <Text className="block ml-1 text-xs text-gray-600">选择对应套餐，点击「立即开通会员」</Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-blue-600 font-bold">4.</Text>
              <Text className="block ml-1 text-xs text-gray-600">告知用户刷新页面，会员状态自动生效</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}