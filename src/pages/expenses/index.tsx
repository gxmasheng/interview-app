import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CreditCard, FileText, Package } from 'lucide-react-taro'
import { Network } from '@/network'

interface ExpenseDetail {
  id: string
  purchaseId: string
  type: 'member' | 'review'
  productName: string
  price: number
  originalPrice?: number
  discount?: number
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
  paymentTime: string
  transactionId: string
  serviceName: string
  validityPeriod?: string
  usedCount?: number
  totalCount?: number
}

// 模拟数据
const MOCK_DETAIL: ExpenseDetail = {
  id: '1',
  purchaseId: 'P001',
  type: 'member',
  productName: '季卡会员',
  price: 59.9,
  originalPrice: 79.9,
  discount: 20,
  status: 'completed',
  paymentMethod: '微信支付',
  paymentTime: '2024-01-17 09:15:30',
  transactionId: 'WX202401170915300001',
  serviceName: 'AI全功能+全题库+2次人工点评',
  validityPeriod: '90天 (2024-01-17 至 2024-04-17)',
  usedCount: 0,
  totalCount: 2
}

export default function ExpensesPage() {
  const [detail, setDetail] = useState<ExpenseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = Taro.getCurrentInstance().router?.params?.id
    if (id) {
      loadDetail(id)
    } else {
      setDetail(MOCK_DETAIL)
      setLoading(false)
    }
  }, [])

  const loadDetail = async (id: string) => {
    try {
      const res = await Network.request({
        url: `/api/payment/expenses/${id}`
      })
      console.log('消费明细响应:', res.data)
      if (res.data?.data) {
        setDetail(res.data.data)
      }
    } catch (error) {
      console.error('加载消费明细失败:', error)
      setDetail(MOCK_DETAIL)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center min-h-screen bg-gray-50">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FileText size={48} color="#9ca3af" />
        <Text className="text-gray-400 mt-3">暂无消费明细</Text>
      </View>
    )
  }

  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 产品信息卡片 */}
      <View className="bg-white p-4 mb-4">
        <View className="flex flex-row items-center mb-4">
          {detail.type === 'member' ? (
            <Package size={24} color="#2563eb" />
          ) : (
            <CreditCard size={24} color="#16a34a" />
          )}
          <View className="ml-3">
            <Text className="text-lg font-semibold text-gray-800">{detail.productName}</Text>
            <Badge variant={detail.status === 'completed' ? 'default' : 'outline'}>
              <Text className={detail.status === 'completed' ? 'text-green-600' : 'text-gray-600'}>
                {detail.status === 'completed' ? '已完成' : '待支付'}
              </Text>
            </Badge>
          </View>
        </View>

        {/* 价格信息 */}
        <View className="bg-blue-50 rounded-lg p-3">
          <View className="flex flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">支付金额</Text>
            <Text className="text-xl font-bold text-blue-600">¥{detail.price}</Text>
          </View>
          {detail.originalPrice && detail.discount && (
            <View className="flex flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">原价 ¥{detail.originalPrice}</Text>
              <Text className="text-xs text-green-600">优惠 ¥{detail.discount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 服务内容 */}
      <View className="bg-white p-4 mb-4">
        <Text className="text-base font-semibold text-gray-800 mb-3">服务内容</Text>
        <Text className="text-sm text-gray-600 mb-2">{detail.serviceName}</Text>
        {detail.validityPeriod && (
          <View className="flex flex-row items-center">
            <Clock size={14} color="#9ca3af" />
            <Text className="text-sm text-gray-500 ml-1">{detail.validityPeriod}</Text>
          </View>
        )}
      </View>

      {/* 使用情况（人工点评） */}
      {detail.usedCount !== undefined && detail.totalCount !== undefined && (
        <View className="bg-white p-4 mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-3">人工点评使用情况</Text>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">赠送次数</Text>
            <Text className="text-sm font-medium text-gray-800">{detail.totalCount}次</Text>
          </View>
          <View className="flex flex-row items-center justify-between mt-2">
            <Text className="text-sm text-gray-600">已使用次数</Text>
            <Text className="text-sm font-medium text-gray-800">{detail.usedCount}次</Text>
          </View>
          <View className="flex flex-row items-center justify-between mt-2">
            <Text className="text-sm text-gray-600">剩余次数</Text>
            <Text className="text-sm font-medium text-green-600">{detail.totalCount - detail.usedCount}次</Text>
          </View>
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-orange-500">⚠️ 会员到期后，未使用的人工点评次数将自动作废</Text>
          </View>
        </View>
      )}

      {/* 支付信息 */}
      <View className="bg-white p-4 mb-4">
        <Text className="text-base font-semibold text-gray-800 mb-3">支付信息</Text>
        <View className="space-y-2">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">支付方式</Text>
            <Text className="text-sm text-gray-800">{detail.paymentMethod}</Text>
          </View>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">支付时间</Text>
            <Text className="text-sm text-gray-800">{detail.paymentTime}</Text>
          </View>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">交易单号</Text>
            <Text className="text-xs text-gray-400">{detail.transactionId}</Text>
          </View>
        </View>
      </View>

      {/* 权益说明 */}
      <View className="bg-orange-50 p-4 mb-4 rounded-lg mx-4">
        <Text className="text-sm font-semibold text-orange-600 mb-2">权益说明</Text>
        <Text className="text-xs text-orange-500">• 会员权益在有效期内可无限次使用AI功能</Text>
        <Text className="text-xs text-orange-500">• 赠送的人工点评次数需在会员有效期内使用</Text>
        <Text className="text-xs text-orange-500">• 会员到期后，未使用的点评次数将自动作废，不退费用</Text>
        <Text className="text-xs text-orange-500">• 如需退款，请在购买后24小时内联系客服</Text>
      </View>

      {/* 底部操作 */}
      <View className="px-4 py-4 bg-white">
        <Button
          onClick={() => Taro.navigateTo({ url: '/pages/purchases/index' })}
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg"
        >
          返回购买记录
        </Button>
      </View>
    </View>
  )
}