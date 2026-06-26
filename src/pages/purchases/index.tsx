import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, Package } from 'lucide-react-taro'
import { Network } from '@/network'

interface PurchaseRecord {
  id: string
  type: 'member' | 'review'
  productName: string
  price: number
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
  createdAt: string
  expireAt?: string
}

// 模拟数据
const MOCK_PURCHASES: PurchaseRecord[] = [
  {
    id: '1',
    type: 'member',
    productName: '月卡会员',
    price: 29.9,
    status: 'completed',
    paymentMethod: '微信支付',
    createdAt: '2024-01-15 10:30:00',
    expireAt: '2024-02-15'
  },
  {
    id: '2',
    type: 'review',
    productName: '单次人工点评',
    price: 39,
    status: 'completed',
    paymentMethod: '微信支付',
    createdAt: '2024-01-16 14:20:00'
  },
  {
    id: '3',
    type: 'member',
    productName: '季卡会员',
    price: 59.9,
    status: 'pending',
    paymentMethod: '微信支付',
    createdAt: '2024-01-17 09:00:00'
  }
]

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    try {
      const res = await Network.request({
        url: '/api/payment/purchases'
      })
      console.log('购买记录响应:', res.data)
      if (res.data?.data) {
        setPurchases(res.data.data)
      }
    } catch (error) {
      console.error('加载购买记录失败:', error)
      setPurchases(MOCK_PURCHASES)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { textClass: 'text-green-600', text: '已完成' }
      case 'pending':
        return { textClass: 'text-yellow-600', text: '待支付' }
      case 'failed':
        return { textClass: 'text-red-600', text: '已取消' }
      default:
        return { textClass: 'text-gray-500', text: status }
    }
  }

  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 统计概览 */}
      <View className="bg-white p-4 mb-4">
        <View className="flex flex-row justify-around">
          <View className="flex flex-col items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {purchases.filter(p => p.type === 'member').length}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">会员购买</Text>
          </View>
          <View className="flex flex-col items-center">
            <Text className="text-2xl font-bold text-green-600">
              {purchases.filter(p => p.type === 'review').length}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">点评购买</Text>
          </View>
          <View className="flex flex-col items-center">
            <Text className="text-2xl font-bold text-gray-800">
              ¥{purchases.reduce((sum, p) => sum + (p.status === 'completed' ? p.price : 0), 0).toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">累计消费</Text>
          </View>
        </View>
      </View>

      {/* 购买记录列表 */}
      <View className="flex-1 px-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">购买记录</Text>

        {loading ? (
          <View className="flex items-center justify-center py-8">
            <Text className="text-gray-400">加载中...</Text>
          </View>
        ) : purchases.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-8">
            <Package size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-3">暂无购买记录</Text>
          </View>
        ) : (
          purchases.map((purchase) => (
            <View
              key={purchase.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm"
              onClick={() => Taro.navigateTo({ url: `/pages/expenses/index?id=${purchase.id}` })}
            >
              <View className="flex flex-row items-center justify-between mb-2">
                <View className="flex flex-row items-center">
                  {purchase.type === 'member' ? (
                    <Package size={20} color="#2563eb" />
                  ) : (
                    <CreditCard size={20} color="#16a34a" />
                  )}
                  <Text className="text-base font-medium text-gray-800 ml-2">
                    {purchase.productName}
                  </Text>
                </View>
                <Badge variant="outline">
                  <Text className={getStatusBadge(purchase.status).textClass}>
                    {getStatusBadge(purchase.status).text}
                  </Text>
                </Badge>
              </View>

              <View className="flex flex-row items-center justify-between text-sm text-gray-500">
                <View className="flex flex-row items-center">
                  <Calendar size={14} color="#9ca3af" />
                  <Text className="ml-1">{purchase.createdAt}</Text>
                </View>
                <Text className="text-lg font-semibold text-blue-600">¥{purchase.price}</Text>
              </View>

              {purchase.expireAt && (
                <View className="mt-2 pt-2 border-t border-gray-100">
                  <Text className="text-xs text-gray-400">有效期至: {purchase.expireAt}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 底部操作 */}
      <View className="px-4 py-4 bg-white">
        <Button
          onClick={() => Taro.navigateTo({ url: '/pages/member/index' })}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          购买会员/点评
        </Button>
      </View>
    </View>
  )
}