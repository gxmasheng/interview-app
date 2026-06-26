import { View, Text, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Headphones, Video, Send } from 'lucide-react-taro'

export default function AdminReviewPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed'>('pending')
  const [orders, setOrders] = useState<any[]>([])
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [scores, setScores] = useState<any>({})
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/review/admin/orders',
        method: 'GET',
        data: { status: activeTab }
      })
      setOrders(res.data.data || [])
    } catch (error) {
      console.error('获取订单失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await Network.request({
        url: `/api/review/admin/orders/${orderId}/accept`,
        method: 'PUT'
      })
      Taro.showToast({ title: '接单成功', icon: 'success' })
      fetchOrders()
    } catch (error) {
      Taro.showToast({ title: '接单失败', icon: 'error' })
    }
  }

  const handleViewOrder = (order: any) => {
    setCurrentOrder(order)
    setScores({
      comprehensive: 15,
      organizational: 15,
      interpersonal: 15,
      emergency: 15,
      language: 8,
      etiquette: 8
    })
    setComment('')
  }

  const handleScoreChange = (dimension: string, value: number) => {
    setScores(prev => ({ ...prev, [dimension]: value }))
  }

  const handleSubmitReview = async () => {
    if (!currentOrder) return
    
    try {
      await Network.request({
        url: `/api/review/admin/orders/${currentOrder.id}/complete`,
        method: 'PUT',
        data: {
          scores: scores,
          totalScore: Object.values(scores).reduce((a: number, b: number) => a + b, 0),
          comment: comment,
          timestampComments: []
        }
      })
      Taro.showToast({ title: '点评完成', icon: 'success' })
      setCurrentOrder(null)
      fetchOrders()
    } catch (error) {
      Taro.showToast({ title: '提交失败', icon: 'error' })
    }
  }

  const getStatusBadge = (status: string): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    switch (status) {
      case 'pending': return { text: '待接单', variant: 'secondary' }
      case 'accepted': return { text: '进行中', variant: 'default' }
      case 'completed': return { text: '已完成', variant: 'default' }
      case 'timeout': return { text: '已超时', variant: 'secondary' }
      default: return { text: status, variant: 'secondary' }
    }
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* Tab 切换 */}
      <View className="bg-white px-4 py-3 flex flex-row border-b border-gray-100">
        {['pending', 'accepted', 'completed'].map((tab) => (
          <View 
            key={tab}
            className={`px-4 py-2 rounded-full mr-2 ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-100'}`}
            onClick={() => setActiveTab(tab as any)}
          >
            <Text className={`block text-sm ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
              {tab === 'pending' ? '待接单' : tab === 'accepted' ? '进行中' : '已完成'}
            </Text>
          </View>
        ))}
      </View>

      {/* 内容区 */}
      {currentOrder ? (
        <View className="p-4">
          {/* 返回按钮 */}
          <View className="mb-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentOrder(null)}>
              <Text className="text-sm">返回列表</Text>
            </Button>
          </View>

          {/* 媒体播放 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">答题视频/音频</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <View className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
                {currentOrder.mediaType === 'video' ? (
                  <Video size={48} color="#2563eb" />
                ) : (
                  <Headphones size={48} color="#2563eb" />
                )}
                <Text className="block text-sm text-gray-600 mt-2">点击播放</Text>
              </View>
            </CardContent>
          </Card>

          {/* 评分区域 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">评分（每项满分20分）</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {[
                { key: 'comprehensive', label: '综合分析' },
                { key: 'organizational', label: '组织协调' },
                { key: 'interpersonal', label: '人际沟通' },
                { key: 'emergency', label: '应急应变' },
                { key: 'language', label: '语言表达', max: 10 },
                { key: 'etiquette', label: '举止仪表', max: 10 }
              ].map((dim) => (
                <View key={dim.key} className="flex flex-row items-center justify-between mb-3">
                  <Text className="block text-sm text-gray-700">{dim.label}</Text>
                  <View className="flex flex-row items-center">
                    <Text className="block text-sm font-medium text-blue-600 mr-2">
                      {scores[dim.key] || 0} 分
                    </Text>
                    <Picker 
                      mode="selector" 
                      range={Array.from({ length: (dim.max || 20) + 1 }, (_, i) => `${i}分`)}
                      value={scores[dim.key] || 0}
                      onChange={(e) => handleScoreChange(dim.key, Number(e.detail.value))}
                    >
                      <View className="px-3 py-1 bg-gray-100 rounded">
                        <Text className="text-sm text-gray-600">调整</Text>
                      </View>
                    </Picker>
                  </View>
                </View>
              ))}
              <View className="border-t border-gray-100 pt-3 mt-3">
                <Text className="block text-base font-medium text-center">
                  {`总分：${Object.values(scores).reduce((a: any, b: any) => Number(a) + Number(b), 0)} 分`}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* 文字点评 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">文字点评</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <View className="bg-gray-50 rounded-lg p-3">
                <Text 
                  className="block text-sm"
                  onClick={() => {
                    setComment('答题思路清晰，逻辑层次分明，表达流畅自然。建议在关键观点处加强论证，提升说服力。')
                    Taro.showToast({ title: '已设置默认点评', icon: 'success' })
                  }}
                >
                  {comment || '点击设置默认点评内容'}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Button className="w-full py-4 bg-blue-600" onClick={handleSubmitReview}>
            <View className="flex flex-row items-center justify-center">
              <Send size={20} color="#ffffff" />
              <Text className="block text-white text-base ml-2">提交点评</Text>
            </View>
          </Button>
        </View>
      ) : (
        <View className="p-4">
          {loading ? (
            <View className="py-12 flex flex-col items-center">
              <Clock size={48} color="#cccccc" />
              <Text className="block text-sm text-gray-400 mt-2">加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="py-12 flex flex-col items-center">
              <Clock size={48} color="#cccccc" />
              <Text className="block text-sm text-gray-400 mt-2">暂无订单</Text>
            </View>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="mb-3">
                <CardContent className="p-4">
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-800">
                        {order.questionTitle || '综合分析类题目'}
                      </Text>
                      <Text className="block text-xs text-gray-500 mt-1">
                        提交时间：{new Date(order.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <Badge variant={getStatusBadge(order.status).variant}>
                      {getStatusBadge(order.status).text}
                    </Badge>
                  </View>
                  <View className="flex flex-row gap-2 mt-3">
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                        <Text className="text-xs">接单</Text>
                      </Button>
                    )}
                    {order.status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                        <Text className="text-xs">点评</Text>
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                        <Text className="text-xs">查看</Text>
                      </Button>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </View>
      )}
    </View>
  )
}