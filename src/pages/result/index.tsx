import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Award, TrendingUp, MessageCircle, Star, RotateCcw } from 'lucide-react-taro'

// 模拟评分数据
const mockScore = {
  total: 78,
  level: 'good',
  dimensions: [
    { key: 'comprehensive', label: '综合分析', score: 16, max: 20, level: '好', desc: '观点明确、逻辑清晰、分析全面' },
    { key: 'organizational', label: '组织协调', score: 16, max: 20, level: '好', desc: '准确理解、有效执行、考虑周全' },
    { key: 'interpersonal', label: '人际沟通', score: 14, max: 20, level: '中', desc: '沟通方式有待改进' },
    { key: 'emergency', label: '应急应变', score: 16, max: 20, level: '好', desc: '反应迅速、措施可行' },
    { key: 'expression', label: '语言表达', score: 8, max: 10, level: '好', desc: '流畅度、条理度良好' },
    { key: 'etiquette', label: '举止仪表', score: 8, max: 10, level: '好', desc: 'AI评分默认值' },
  ],
}

const ResultPage: FC = () => {
  useLoad(() => {
    console.log('评分结果页面加载完成')
  })

  const getScoreColor = (level: string) => {
    if (level === '好' || level === 'good') return '#22c55e'
    if (level === '中' || level === 'medium') return '#f59e0b'
    return '#ef4444'
  }

  const getLevelBadge = (level: string) => {
    if (level === '好' || level === 'good') return 'bg-green-500 text-white'
    if (level === '中' || level === 'medium') return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 总分展示 */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <View className="flex flex-col items-center">
            <Award size={48} color="#2563eb" className="mb-2" />
            <Text className="block text-4xl font-bold text-blue-600 mb-2">{mockScore.total}</Text>
            <Badge className={`mb-2 ${getLevelBadge(mockScore.level)}`}>
              {mockScore.level === 'good' ? '好' : mockScore.level === 'medium' ? '中' : '差'}
            </Badge>
            <Text className="block text-sm text-gray-500">总分 100 分</Text>
          </View>
        </CardContent>
      </Card>

      {/* 六维度评分 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp size={18} color="#2563eb" className="mr-2" />
            六维度评分详情
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mockScore.dimensions.map((dim) => (
            <View key={dim.key} className="mb-4">
              <View className="flex items-center justify-between mb-1">
                <Text className="block text-sm font-medium text-gray-900">{dim.label}</Text>
                <View className="flex items-center">
                  <Text className="block text-sm font-semibold mr-2" style={{ color: getScoreColor(dim.level) }}>
                    {dim.score}/{dim.max}分
                  </Text>
                  <Badge className={getLevelBadge(dim.level)} variant="outline">
                    {dim.level}
                  </Badge>
                </View>
              </View>
              <Progress value={(dim.score / dim.max) * 100} className="h-2" />
              <Text className="block text-xs text-gray-500 mt-1">{dim.desc}</Text>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <View className="flex gap-3 mb-4">
        <Button variant="outline" className="flex-1">
          <Star size={16} color="#f59e0b" className="mr-1" />
          <Text>收藏题目</Text>
        </Button>
        <Button className="flex-1">
          <MessageCircle size={16} color="#fff" className="mr-1" />
          <Text>查看点评</Text>
        </Button>
      </View>

      {/* 重新练习 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Button variant="outline" className="w-full">
            <RotateCcw size={16} color="#2563eb" className="mr-1" />
            <Text>重新练习此题</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  )
}

export default ResultPage