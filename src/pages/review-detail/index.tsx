import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Headphones, Clock, Star, MessageSquare, Lightbulb, BookOpen, Video } from 'lucide-react-taro'

export default function ReviewDetailPage() {
  const [review, setReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = Taro.getCurrentInstance().router?.params?.id
    if (id) {
      fetchReviewDetail(id)
    }
  }, [])

  const fetchReviewDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: `/api/review/orders/${id}`,
        method: 'GET'
      })
      setReview(res.data.data)
    } catch (error) {
      console.error('获取详情失败', error)
      Taro.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Clock size={48} color="#cccccc" />
        <Text className="block text-sm text-gray-400 mt-2">加载中...</Text>
      </View>
    )
  }

  if (!review) {
    return (
      <View className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Clock size={48} color="#cccccc" />
        <Text className="block text-sm text-gray-400 mt-2">未找到订单</Text>
      </View>
    )
  }

  const scores = review.scores || {}
  const totalScore = review.totalScore || 0
  const comment = review.comment || ''
  const timestampComments = review.timestampComments || []

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 媒体播放区 */}
      <Card className="mb-4 mx-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">答题记录</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <View className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
            {review.mediaType === 'video' ? (
              <Video size={48} color="#2563eb" />
            ) : (
              <Headphones size={48} color="#2563eb" />
            )}
            <Text className="block text-sm text-gray-600 mt-2">点击播放</Text>
          </View>
        </CardContent>
      </Card>

      {/* 总分展示 */}
      <Card className="mb-4 mx-4">
        <CardContent className="p-4">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Star size={24} color="#f59e0b" />
              <Text className="block text-lg font-bold text-gray-800 ml-2">总分</Text>
            </View>
            <Text className="block text-2xl font-bold text-blue-600">{totalScore} 分</Text>
          </View>
          <View className="mt-2">
            <Badge variant={totalScore >= 80 ? 'default' : totalScore >= 60 ? 'secondary' : 'secondary'}>
              {totalScore >= 80 ? '优秀' : totalScore >= 60 ? '良好' : '需改进'}
            </Badge>
          </View>
        </CardContent>
      </Card>

      {/* 分项得分 */}
      <Card className="mb-4 mx-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">分项得分</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {[
            { key: 'comprehensive', label: '综合分析能力', max: 20 },
            { key: 'organizational', label: '组织协调能力', max: 20 },
            { key: 'interpersonal', label: '人际沟通能力', max: 20 },
            { key: 'emergency', label: '应急应变能力', max: 20 },
            { key: 'language', label: '语言表达能力', max: 10 },
            { key: 'etiquette', label: '举止仪表', max: 10 }
          ].map((dim) => (
            <View key={dim.key} className="flex flex-row items-center justify-between mb-3 py-2 border-b border-gray-100 last:border-b-0">
              <Text className="block text-sm text-gray-700">{dim.label}</Text>
              <View className="flex flex-row items-center">
                <Text className="block text-sm font-medium text-blue-600 mr-1">
                  {scores[dim.key] || 0}
                </Text>
                <Text className="block text-xs text-gray-400">/{dim.max}</Text>
              </View>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 文字点评 */}
      {comment && (
        <Card className="mb-4 mx-4">
          <CardHeader className="pb-2">
            <View className="flex flex-row items-center">
              <MessageSquare size={18} color="#2563eb" />
              <CardTitle className="text-base ml-2">专家点评</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="pt-2">
            <Text className="block text-sm text-gray-700 leading-relaxed">{comment}</Text>
          </CardContent>
        </Card>
      )}

      {/* 时间点标记 */}
      {timestampComments.length > 0 && (
        <Card className="mb-4 mx-4">
          <CardHeader className="pb-2">
            <View className="flex flex-row items-center">
              <Clock size={18} color="#f59e0b" />
              <CardTitle className="text-base ml-2">时间点标记</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="pt-2">
            {timestampComments.map((ts: any, index: number) => (
              <View key={index} className="mb-2 p-2 bg-yellow-50 rounded">
                <Text className="block text-xs text-yellow-600 font-medium">
                  {ts.timestamp}
                </Text>
                <Text className="block text-sm text-gray-700 mt-1">{ts.comment}</Text>
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 优化建议 */}
      <Card className="mb-4 mx-4">
        <CardHeader className="pb-2">
          <View className="flex flex-row items-center">
            <Lightbulb size={18} color="#10b981" />
            <CardTitle className="text-base ml-2">优化建议</CardTitle>
          </View>
        </CardHeader>
        <CardContent className="pt-2">
          {totalScore < 80 && (
            <View className="space-y-2">
              {scores.comprehensive < 16 && (
                <Text className="block text-sm text-gray-700">• 加强综合分析能力训练，注意多角度思考问题</Text>
              )}
              {scores.organizational < 16 && (
                <Text className="block text-sm text-gray-700">• 提升组织协调能力，关注任务执行的完整性</Text>
              )}
              {scores.interpersonal < 16 && (
                <Text className="block text-sm text-gray-700">• 注意人际沟通技巧，多练习换位思考</Text>
              )}
              {scores.emergency < 16 && (
                <Text className="block text-sm text-gray-700">• 增强应急应变训练，培养快速反应能力</Text>
              )}
            </View>
          )}
          {totalScore >= 80 && (
            <Text className="block text-sm text-green-600">表现优秀！继续保持良好的答题习惯。</Text>
          )}
        </CardContent>
      </Card>

      {/* 高分框架参考 */}
      <Card className="mb-4 mx-4">
        <CardHeader className="pb-2">
          <View className="flex flex-row items-center">
            <BookOpen size={18} color="#8b5cf6" />
            <CardTitle className="text-base ml-2">高分答题框架</CardTitle>
          </View>
        </CardHeader>
        <CardContent className="pt-2">
          <View className="bg-purple-50 rounded-lg p-3">
            <Text className="block text-sm text-purple-800 font-medium mb-2">综合分析类答题框架：</Text>
            <Text className="block text-xs text-gray-700 leading-relaxed">
              1. 表态：明确观点立场{'\n'}
              2. 分析：多角度深入分析（原因、影响）{'\n'}
              3. 对策：提出针对性解决方案{'\n'}
              4. 总结：升华观点，展现担当
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* 底部操作 */}
      <View className="px-4">
        <Button variant="outline" className="w-full" onClick={() => Taro.navigateBack()}>
          <Text className="text-sm">返回订单列表</Text>
        </Button>
      </View>
    </View>
  )
}