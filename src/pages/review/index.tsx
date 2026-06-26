import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Clock, CircleCheck, Headphones, Video } from 'lucide-react-taro'

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'orders'>('submit')
  const [orders, setOrders] = useState<any[]>([])
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio')
  const [uploading, setUploading] = useState(false)
  const [questionTitle, setQuestionTitle] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await Network.request({
        url: '/api/review/orders',
        method: 'GET'
      })
      setOrders(res.data.data || [])
    } catch (error) {
      console.error('获取订单失败', error)
    }
  }

  const handleChooseMedia = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: [mediaType] as any,
        sourceType: ['album', 'camera']
      })
      
      if (res.tempFiles && res.tempFiles.length > 0) {
        const tempFile = res.tempFiles[0]
        await uploadMedia(tempFile.tempFilePath)
      }
    } catch (error) {
      console.error('选择媒体失败', error)
    }
  }

  const uploadMedia = async (filePath: string) => {
    setUploading(true)
    try {
      const res = await Network.uploadFile({
        url: '/api/review/upload',
        filePath: filePath,
        name: 'media'
      })
      
      console.log('上传结果:', res)
      
      // 创建订单
      const uploadRes = res as any
      await Network.request({
        url: '/api/review/orders',
        method: 'POST',
        data: {
          mediaUrl: uploadRes.data?.url || uploadRes.url,
          mediaType: mediaType,
          questionTitle: questionTitle || '综合分析类题目'
        }
      })
      
      Taro.showToast({ title: '提交成功', icon: 'success' })
      fetchOrders()
      setActiveTab('orders')
    } catch (error) {
      console.error('上传失败', error)
      Taro.showToast({ title: '上传失败', icon: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const goToDetail = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/review-detail/index?id=${orderId}` })
  }

  const goToMember = () => {
    Taro.navigateTo({ url: '/pages/member/index' })
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* Tab 切换 */}
      <View className="bg-white px-4 py-3 flex flex-row border-b border-gray-100">
        <View 
          className={`px-4 py-2 rounded-full mr-3 ${activeTab === 'submit' ? 'bg-blue-600' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('submit')}
        >
          <Text className={`block text-sm ${activeTab === 'submit' ? 'text-white' : 'text-gray-600'}`}>提交答题</Text>
        </View>
        <View 
          className={`px-4 py-2 rounded-full ${activeTab === 'orders' ? 'bg-blue-600' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('orders')}
        >
          <Text className={`block text-sm ${activeTab === 'orders' ? 'text-white' : 'text-gray-600'}`}>我的订单</Text>
        </View>
      </View>

      {activeTab === 'submit' ? (
        <View className="p-4">
          {/* 会员权益提示 */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  <CircleCheck size={20} color="#2563eb" />
                  <Text className="block text-sm text-gray-700 ml-2">人工点评权益：0 次</Text>
                </View>
                <Button size="sm" onClick={goToMember}>
                  <Text className="text-xs">购买会员</Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* 媒体类型选择 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">选择上传类型</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <View className="flex flex-row gap-4">
                <View 
                  className={`flex-1 py-3 rounded-lg flex flex-col items-center ${mediaType === 'audio' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50'}`}
                  onClick={() => setMediaType('audio')}
                >
                  <Headphones size={24} color={mediaType === 'audio' ? '#2563eb' : '#666666'} />
                  <Text className={`block text-sm mt-1 ${mediaType === 'audio' ? 'text-blue-600' : 'text-gray-600'}`}>音频答题</Text>
                </View>
                <View 
                  className={`flex-1 py-3 rounded-lg flex flex-col items-center ${mediaType === 'video' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50'}`}
                  onClick={() => setMediaType('video')}
                >
                  <Video size={24} color={mediaType === 'video' ? '#2563eb' : '#666666'} />
                  <Text className={`block text-sm mt-1 ${mediaType === 'video' ? 'text-blue-600' : 'text-gray-600'}`}>视频答题</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 题目输入 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">答题题目（可选）</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="block text-sm text-gray-500 mb-1">请简要描述题目内容</Text>
                <Text 
                  className="block text-base"
                  onClick={() => {
                    setQuestionTitle('综合分析类题目')
                    Taro.showToast({ title: '已设置默认题目', icon: 'success' })
                  }}
                >
                  {questionTitle || '点击设置默认题目'}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* 上传按钮 */}
          <Button 
            className="w-full py-4 bg-blue-600" 
            onClick={handleChooseMedia}
            disabled={uploading}
          >
            <View className="flex flex-row items-center justify-center">
              <Upload size={20} color="#ffffff" />
              <Text className="block text-white text-base ml-2">
                {uploading ? '上传中...' : '选择并上传答题'}
              </Text>
            </View>
          </Button>

          {/* 说明 */}
          <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <Text className="block text-sm text-yellow-700">
              提示：人工点评将在24小时内完成，您可在「我的订单」中查看进度和结果。
            </Text>
          </View>
        </View>
      ) : (
        <View className="p-4">
          {/* 订单列表 */}
          {orders.length === 0 ? (
            <View className="py-12 flex flex-col items-center">
              <Clock size={48} color="#cccccc" />
              <Text className="block text-sm text-gray-400 mt-2">暂无订单</Text>
            </View>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="mb-3" onClick={() => goToDetail(order.id)}>
                <CardContent className="p-4">
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-800">
                        {order.questionTitle || '综合分析类题目'}
                      </Text>
                      <Text className="block text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status === 'pending' ? '待处理' : 
                       order.status === 'accepted' ? '进行中' : 
                       order.status === 'completed' ? '已完成' : '已超时'}
                    </Badge>
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