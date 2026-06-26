import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Lightbulb, CircleAlert, BookOpen, Target } from 'lucide-react-taro'

// 模拟点评数据
const mockFeedback = {
  highlights: [
    '能够从多角度辩证分析问题，展现了良好的综合分析能力',
    '提出的对策具有针对性，体现了务实的工作态度',
    '答题结构清晰，遵循了"表态—分析原因—提出对策"的逻辑框架',
  ],
  weaknesses: [
    '在人际沟通维度，未能充分体现换位思考的能力',
    '对问题的深层原因分析不够透彻，建议进一步挖掘本质',
    '语言表达略显生硬，建议适当增加过渡语衔接',
  ],
  suggestions: [
    '建议在答题时增加"换位思考"的表述，如"作为当事人，我理解..."',
    '可引用相关政策文件或名言金句，增强答案说服力',
    '注意控制答题时间，确保每个要点都有充分论述',
  ],
  referenceThought: '高分答题思路：首先明确表态（辩证看待），然后从社会层面和个人层面分析原因，接着从政府、社会、个人三个维度提出对策，最后进行价值升华。关键是要体现责任担当意识，展现作为公务员应有的职业素养。',
}

const FeedbackPage: FC = () => {
  useLoad(() => {
    console.log('点评页面加载完成')
  })

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 即时点评 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Lightbulb size={18} color="#22c55e" className="mr-2" />
            答题亮点
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mockFeedback.highlights.map((item, index) => (
            <View key={index} className="flex items-start mb-3">
              <Badge className="bg-green-100 text-green-700 mr-2 flex-shrink-0">{index + 1}</Badge>
              <Text className="block text-sm text-gray-900 leading-relaxed">{item}</Text>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 不足之处 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CircleAlert size={18} color="#ef4444" className="mr-2" />
            需要改进
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mockFeedback.weaknesses.map((item, index) => (
            <View key={index} className="flex items-start mb-3">
              <Badge className="bg-red-100 text-red-700 mr-2 flex-shrink-0">{index + 1}</Badge>
              <Text className="block text-sm text-gray-900 leading-relaxed">{item}</Text>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 改进建议 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Target size={18} color="#2563eb" className="mr-2" />
            改进建议
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {mockFeedback.suggestions.map((item, index) => (
            <View key={index} className="flex items-start mb-3">
              <Badge className="bg-blue-100 text-blue-700 mr-2 flex-shrink-0">{index + 1}</Badge>
              <Text className="block text-sm text-gray-900 leading-relaxed">{item}</Text>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* 高分答题思路 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BookOpen size={18} color="#f59e0b" className="mr-2" />
            高分答题思路参考
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Text className="block text-sm text-gray-900 leading-relaxed">
            {mockFeedback.referenceThought}
          </Text>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <View className="flex gap-3 mb-4">
        <Button variant="outline" className="flex-1">
          <Text>收藏此点评</Text>
        </Button>
        <Button className="flex-1">
          <MessageCircle size={16} color="#fff" className="mr-1" />
          <Text>继续练习</Text>
        </Button>
      </View>
    </View>
  )
}

export default FeedbackPage