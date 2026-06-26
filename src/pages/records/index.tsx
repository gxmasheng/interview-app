import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { History, Clock, Star, CircleAlert } from 'lucide-react-taro'

// 模拟答题记录
const mockRecords = [
  {
    id: 1,
    questionTitle: '当前社会上存在"躺平"现象...',
    questionType: '综合分析',
    score: 85,
    scoreLevel: 'good',
    createdAt: '2024-01-15 14:30',
    isFavorited: true,
    favoriteType: 'good',
  },
  {
    id: 2,
    questionTitle: '你是新入职的公务员，领导安排...',
    questionType: '组织协调',
    score: 62,
    scoreLevel: 'medium',
    createdAt: '2024-01-15 10:20',
    isFavorited: false,
    favoriteType: null,
  },
  {
    id: 3,
    questionTitle: '你和同事在处理一项工作任务时...',
    questionType: '人际沟通',
    score: 48,
    scoreLevel: 'poor',
    createdAt: '2024-01-14 16:45',
    isFavorited: true,
    favoriteType: 'error',
  },
]

const RecordsPage: FC = () => {
  useLoad(() => {
    console.log('记录页面加载完成')
  })

  const getScoreColor = (level: string) => {
    if (level === 'good') return '#22c55e'
    if (level === 'medium') return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (level: string) => {
    if (level === 'good') return '好'
    if (level === 'medium') return '中'
    return '差'
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 页面标题 */}
      <View className="mb-4">
        <Text className="block text-xl font-bold text-gray-900">答题记录</Text>
        <Text className="block text-sm text-gray-500 mt-1">查看历史练习与收藏</Text>
      </View>

      {/* Tabs 分类 */}
      <Tabs defaultValue="all" className="mb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="all">
            <History size={14} color="#999" className="mr-1" />
            <Text className="block text-xs">全部记录</Text>
          </TabsTrigger>
          <TabsTrigger value="error">
            <CircleAlert size={14} color="#ef4444" className="mr-1" />
            <Text className="block text-xs">错题收藏</Text>
          </TabsTrigger>
          <TabsTrigger value="good">
            <Star size={14} color="#f59e0b" className="mr-1" />
            <Text className="block text-xs">好题收藏</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <View className="mt-4">
            {mockRecords.map((record) => (
              <Card key={record.id} className="mb-3 cursor-pointer">
                <CardContent className="p-4">
                  <View className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{record.questionType}</Badge>
                    <View className="flex items-center">
                      <Text className="block text-sm font-semibold" style={{ color: getScoreColor(record.scoreLevel) }}>
                        {record.score}分
                      </Text>
                      <Badge className="ml-2" style={{ backgroundColor: getScoreColor(record.scoreLevel), color: '#fff' }}>
                        {getScoreLabel(record.scoreLevel)}
                      </Badge>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-900 mb-2 leading-relaxed">
                    {record.questionTitle}
                  </Text>
                  <View className="flex items-center justify-between">
                    <View className="flex items-center">
                      <Clock size={12} color="#9ca3af" className="mr-1" />
                      <Text className="block text-xs text-gray-400">{record.createdAt}</Text>
                    </View>
                    {record.isFavorited && (
                      <Star size={14} color={record.favoriteType === 'good' ? '#f59e0b' : '#ef4444'} />
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </TabsContent>

        <TabsContent value="error">
          <View className="mt-4">
            {mockRecords
              .filter((r) => r.favoriteType === 'error')
              .map((record) => (
                <Card key={record.id} className="mb-3 cursor-pointer">
                  <CardContent className="p-4">
                    <View className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{record.questionType}</Badge>
                      <Text className="block text-sm font-semibold text-red-500">{record.score}分</Text>
                    </View>
                    <Text className="block text-sm text-gray-900">{record.questionTitle}</Text>
                  </CardContent>
                </Card>
              ))}
          </View>
        </TabsContent>

        <TabsContent value="good">
          <View className="mt-4">
            {mockRecords
              .filter((r) => r.favoriteType === 'good')
              .map((record) => (
                <Card key={record.id} className="mb-3 cursor-pointer">
                  <CardContent className="p-4">
                    <View className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{record.questionType}</Badge>
                      <Text className="block text-sm font-semibold text-green-500">{record.score}分</Text>
                    </View>
                    <Text className="block text-sm text-gray-900">{record.questionTitle}</Text>
                  </CardContent>
                </Card>
              ))}
          </View>
        </TabsContent>
      </Tabs>
    </View>
  )
}

export default RecordsPage