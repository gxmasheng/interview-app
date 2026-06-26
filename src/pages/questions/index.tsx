import { View, Text } from '@tarojs/components'
import { useLoad, navigateTo } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileText, Star } from 'lucide-react-taro'

// 题型映射
const questionTypes = [
  { key: 'comprehensive', label: '综合分析', desc: '观点明确、逻辑清晰、分析全面' },
  { key: 'organizational', label: '组织协调', desc: '准确理解、有效执行、考虑周全' },
  { key: 'interpersonal', label: '人际沟通', desc: '换位思考、沟通有效、化解矛盾' },
  { key: 'emergency', label: '应急应变', desc: '反应迅速、措施可行、处理得当' },
]

// 模拟题目数据
const mockQuestions = [
  {
    id: 1,
    type: 'comprehensive',
    title: '当前社会上存在"躺平"现象，有人认为这是一种消极逃避，也有人认为这是年轻人的自我保护。请谈谈你的看法。',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    id: 2,
    type: 'comprehensive',
    title: '近年来，"网红经济"快速发展，带来了巨大的经济效益，但也引发了一些问题。请分析"网红经济"的利弊并提出对策。',
    difficulty: 4,
    source: '2024年国考真题',
  },
  {
    id: 3,
    type: 'organizational',
    title: '你是新入职的公务员，领导安排你组织一次单位内部的学习交流活动，你会如何组织？',
    difficulty: 2,
    source: '2023年市考真题',
  },
  {
    id: 4,
    type: 'interpersonal',
    title: '你和同事在处理一项工作任务时产生了分歧，同事认为你的方案不合理，你会如何处理？',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    id: 5,
    type: 'emergency',
    title: '你是某单位窗口服务人员，一位群众因为材料不全无法办理业务，情绪激动并在现场大声抱怨，你会如何处理？',
    difficulty: 4,
    source: '2024年国考真题',
  },
]

const QuestionsPage: FC = () => {
  useLoad(() => {
    console.log('题库页面加载完成')
  })

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return '较易'
    if (level === 3) return '中等'
    return '较难'
  }

  const handleQuestionClick = (questionId: number) => {
    navigateTo({
      url: `/pages/answer/index?id=${questionId}`
    })
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 页面标题 */}
      <View className="mb-4">
        <Text className="block text-xl font-bold text-gray-900">题库</Text>
        <Text className="block text-sm text-gray-500 mt-1">四大题型分类训练</Text>
      </View>

      {/* 题型筛选 */}
      <Tabs defaultValue="comprehensive" className="mb-4">
        <TabsList className="grid grid-cols-4">
          {questionTypes.map((type) => (
            <TabsTrigger key={type.key} value={type.key}>
              <Text className="block text-xs">{type.label}</Text>
            </TabsTrigger>
          ))}
        </TabsList>

        {questionTypes.map((type) => (
          <TabsContent key={type.key} value={type.key}>
            <View className="mt-4">
              <Text className="block text-sm text-gray-500 mb-3">{type.desc}</Text>
              {mockQuestions
                .filter((q) => q.type === type.key)
                .map((question) => (
                  <Card key={question.id} className="mb-3 cursor-pointer" onClick={() => handleQuestionClick(question.id)}>
                    <CardContent className="p-4">
                      <View className="flex items-start justify-between">
                        <View className="flex-1">
                          <View className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                            <Text className="block text-xs text-gray-400">{question.source}</Text>
                          </View>
                          <Text className="block text-sm font-medium text-gray-900 leading-relaxed">
                            {question.title}
                          </Text>
                        </View>
                        <Star size={18} color="#9ca3af" className="ml-2 flex-shrink-0" />
                      </View>
                    </CardContent>
                  </Card>
                ))}
            </View>
          </TabsContent>
        ))}
      </Tabs>

      {/* 底部统计 */}
      <View className="flex items-center justify-center py-4">
        <FileText size={16} color="#9ca3af" className="mr-1" />
        <Text className="block text-xs text-gray-400">共 {mockQuestions.length} 题目可练习</Text>
      </View>
    </View>
  )
}

export default QuestionsPage