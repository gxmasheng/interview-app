import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import type { FC } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Timer, Mic, Send, TriangleAlert, CircleAlert, CircleCheck } from 'lucide-react-taro'
import { Network } from '@/network'

interface Question {
  id: number
  type: string
  title: string
  difficulty: number
  source?: string
}

interface ScoreData {
  score: number
  level: string
  evaluation: string
  suggestions: string[]
  referenceAnswer: string
  feedback: {
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
    referenceAnswer: string
  }
}

const typeLabels: Record<string, string> = {
  comprehensive: '综合分析',
  organizational: '组织协调',
  interpersonal: '人际沟通',
  emergency: '应急应变',
}

const AnswerPage: FC = () => {
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'thinking' | 'answering' | 'scoring' | 'finished'>('thinking')
  const [timeLeft, setTimeLeft] = useState(60) //审题时间1分钟
  const [answer, setAnswer] = useState('')
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [scoringError, setScoringError] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 检测平台
  const isMiniApp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP || Taro.getEnv() === Taro.ENV_TYPE.TT

  // 获取题目数据
  useEffect(() => {
    const questionId = router.params?.id
    if (questionId) {
      fetchQuestion(parseInt(questionId))
    } else {
      setLoading(false)
    }
  }, [router.params])

  const fetchQuestion = async (id: number) => {
    try {
      const res = await Network.request({ url: `/api/questions/${id}` })
      console.log('获取题目:', res.data)
      if (res.data?.data) {
        setQuestion(res.data.data)
      }
    } catch (error) {
      console.error('获取题目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计时器逻辑
  useEffect(() => {
    if (phase === 'finished' || phase === 'scoring' || loading) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'thinking') {
            setPhase('answering')
            return 180
          } else {
            handleAutoSubmit()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, loading])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseLabel = () => {
    if (phase === 'thinking') return '审题阶段'
    if (phase === 'answering') return '答题阶段'
    if (phase === 'scoring') return '评分中'
    return '评分完成'
  }

  const handleSkipThinking = () => {
    if (phase === 'thinking') {
      setPhase('answering')
      setTimeLeft(180)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (answer.trim()) {
      submitForScore()
    } else {
      setPhase('finished')
      setScoringError('答题时间已结束，但未输入答案内容')
    }
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      Taro.showToast({ title: '请先输入答案内容', icon: 'none' })
      return
    }
    if (timerRef.current) clearInterval(timerRef.current)
    submitForScore()
  }

  const submitForScore = async () => {
    setPhase('scoring')
    setScoringError('')

    try {
      const res = await Network.request({
        url: '/api/interview/score',
        method: 'POST',
        data: {
          questionId: question?.id,
          questionType: question?.type,
          questionTitle: question?.title,
          answer: answer,
          userId: 'web_user_' + Date.now()
        }
      })

      console.log('评分结果:', res.data)

      if (res.data?.data) {
        // 单项练习评分结果
        const scoreResult = res.data.data
        
        const processedData: ScoreData = {
          score: scoreResult?.score || 0,
          level: scoreResult?.level || '差',
          evaluation: scoreResult?.evaluation || '',
          suggestions: scoreResult?.suggestions || [],
          referenceAnswer: scoreResult?.referenceAnswer || '',
          feedback: {
            strengths: scoreResult?.feedback?.strengths || [],
            weaknesses: scoreResult?.feedback?.weaknesses || [],
            improvements: scoreResult?.feedback?.improvements || [],
            referenceAnswer: scoreResult?.referenceAnswer || ''
          }
        }
        
        setScoreData(processedData)
        setPhase('finished')
      } else {
        setScoringError('评分服务返回数据异常')
        setPhase('finished')
      }
    } catch (error) {
      console.error('评分失败:', error)
      setScoringError('评分服务暂时不可用，请稍后重试')
      setPhase('finished')
    }
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Text className="block text-gray-500">加载中...</Text>
      </View>
    )
  }

  if (!question) {
    return (
      <View className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Text className="block text-gray-500">未找到题目</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 题目信息 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <View className="flex items-center justify-between">
            <Badge variant="default">{typeLabels[question.type] || question.type}</Badge>
            <Text className="block text-xs text-gray-400">{question.source || '公务员面试真题'}</Text>
          </View>
        </CardHeader>
        <CardContent className="p-4">
          <Text className="block text-lg font-semibold text-gray-900 leading-relaxed">
            {question.title}
          </Text>
        </CardContent>
      </Card>

      {/* 计时器 */}
      {phase !== 'finished' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-3">
              <View className="flex items-center">
                <Timer size={20} color={timeLeft <= 30 ? '#ef4444' : '#2563eb'} className="mr-2" />
                <Text className="block text-base font-medium text-gray-900">{getPhaseLabel()}</Text>
              </View>
              <Text className="block text-2xl font-bold" style={{ color: timeLeft <= 30 ? '#ef4444' : '#2563eb' }}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            <Progress value={phase === 'thinking' ? ((60 - timeLeft) / 60) * 100 : ((180 - timeLeft) / 180) * 100} className="h-2" />
            {timeLeft <= 30 && phase === 'answering' && (
              <View className="flex items-center mt-2">
                <TriangleAlert size={14} color="#ef4444" className="mr-1" />
                <Text className="block text-xs text-red-500">即将超时，请抓紧时间</Text>
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {/* 审题阶段 */}
      {phase === 'thinking' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base text-gray-600 mb-4 text-center">
              请仔细阅读题目，思考答题思路...
            </Text>
            <Button variant="outline" className="w-full" onClick={handleSkipThinking}>
              <Text>提前开始答题</Text>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 答题阶段 */}
      {phase === 'answering' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-gray-900 mb-2">请输入你的答案：</Text>
            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
              <Textarea
                style={{ width: '100%', minHeight: '200px', backgroundColor: 'transparent' }}
                placeholder="请在此输入你的答案内容..."
                maxlength={2000}
                value={answer}
                onInput={(e) => setAnswer(e.detail.value)}
              />
            </View>
            <Text className="block text-xs text-gray-400 mb-4">
              已输入 {answer.length} 字，最多 2000 字
            </Text>
            <View className="flex gap-3">
              {!isMiniApp && (
                <Button variant="outline" className="flex-1" onClick={() => Taro.showToast({ title: '语音答题仅在小程序中可用', icon: 'none' })}>
                  <Mic size={16} color="#2563eb" className="mr-1" />
                  <Text>语音答题</Text>
                </Button>
              )}
              <Button className="flex-1" onClick={handleSubmit}>
                <Send size={16} color="#fff" className="mr-1" />
                <Text>提交答案</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 评分中 */}
      {phase === 'scoring' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base text-center text-gray-600">
              AI正在分析您的答案，请稍候...
            </Text>
          </CardContent>
        </Card>
      )}

      {/* 评分结果 */}
      {phase === 'finished' && scoringError && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex items-center mb-2">
              <CircleAlert size={20} color="#ef4444" className="mr-2" />
              <Text className="block text-base font-medium text-red-500">评分失败</Text>
            </View>
            <Text className="block text-sm text-gray-600 mb-4">{scoringError}</Text>
            <Button variant="outline" className="w-full" onClick={() => Taro.navigateBack()}>
              <Text>返回题库</Text>
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === 'finished' && scoreData && (
        <>
          {/* 评分卡片 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <View className="flex items-center justify-center mb-4">
                <CircleCheck size={24} color="#22c55e" className="mr-2" />
                <Text className="block text-lg font-semibold text-green-600">评分完成</Text>
              </View>
              
              {/* 得分展示 */}
              <View className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
                <Text className="block text-sm text-gray-500 mb-1">
                  {typeLabels[question.type]}能力得分（满分20分）
                </Text>
                <Text className="block text-4xl font-bold text-blue-600 mb-2">
                  {scoreData.score}分
                </Text>
                <Badge 
                  variant={scoreData.level === '好' ? 'default' : scoreData.level === '中' ? 'secondary' : 'destructive'}
                  className="px-4 py-1"
                >
                  {scoreData.level}档
                </Badge>
              </View>

              {/* 评分档次说明 */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="block text-sm font-medium text-gray-700 mb-2">评分标准</Text>
                <View className="flex flex-col gap-2">
                  <View className="flex items-center">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <Text className="block text-sm text-gray-600">好（16-20分）：观点明确、逻辑清晰、分析全面、有深度</Text>
                  </View>
                  <View className="flex items-center">
                    <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                    <Text className="block text-sm text-gray-600">中（11-15分）：分析基本到位，角度不够全面</Text>
                  </View>
                  <View className="flex items-center">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                    <Text className="block text-sm text-gray-600">差（0-10分）：认识片面、缺乏思路、条理性差</Text>
                  </View>
                </View>
              </View>

              {/* 评分说明 */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="block text-sm font-medium text-gray-700 mb-2">详细点评</Text>
                <Text className="block text-sm text-gray-600 leading-relaxed">
                  {scoreData.evaluation || '暂无点评'}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* 答题亮点 */}
          {scoreData.feedback.strengths && scoreData.feedback.strengths.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Text className="block text-base font-medium text-green-600 mb-3">答题亮点</Text>
                {scoreData.feedback.strengths.map((item, idx) => (
                  <View key={idx} className="flex items-start mb-2">
                    <CircleCheck size={16} color="#22c55e" className="mr-2 mt-1" />
                    <Text className="block text-sm text-gray-700">{item}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 不足之处 */}
          {scoreData.feedback.weaknesses && scoreData.feedback.weaknesses.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Text className="block text-base font-medium text-orange-600 mb-3">不足之处</Text>
                {scoreData.feedback.weaknesses.map((item, idx) => (
                  <View key={idx} className="flex items-start mb-2">
                    <TriangleAlert size={16} color="#f97316" className="mr-2 mt-1" />
                    <Text className="block text-sm text-gray-700">{item}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 优化建议 */}
          {scoreData.suggestions && scoreData.suggestions.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Text className="block text-base font-medium text-blue-600 mb-3">优化建议</Text>
                {scoreData.suggestions.map((item, idx) => (
                  <View key={idx} className="mb-3">
                    <Text className="block text-sm text-gray-700">{idx + 1}. {item}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 参考答案 */}
          {scoreData.feedback.referenceAnswer && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Text className="block text-base font-medium text-gray-700 mb-3">高分答题参考思路</Text>
                <Text className="block text-sm text-gray-600 leading-relaxed">
                  {scoreData.feedback.referenceAnswer}
                </Text>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <View className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setPhase('thinking')
                    setTimeLeft(60) // 审题时间1分钟
                    setAnswer('')
                    setScoreData(null)
                    setScoringError('')
                  }}
                >
                  <Text>重新练习</Text>
                </Button>
                <Button className="flex-1" onClick={() => Taro.navigateBack()}>
                  <Text>返回题库</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </>
      )}
    </View>
  )
}

export default AnswerPage