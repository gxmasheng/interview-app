import { useState, useEffect, useRef, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {Textarea } from '@/components/ui/textarea'
import { Timer, Mic, MicOff, Square, Play, ChevronRight, Volume2, Info, PenLine } from 'lucide-react-taro'
import { Network } from '@/network'

// 题型定义
const QUESTION_TYPES = [
  { type: 'comprehensive', name: '综合分析', order: 1 },
  { type: 'organizational', name: '组织协调', order: 2 },
  { type: 'interpersonal', name: '人际沟通', order: 3 },
  { type: 'emergency', name: '应急应变', order: 4 },
]

// 阶段定义
type Phase = 'intro' | 'thinking' | 'answering' | 'summary' | 'report'

// 时间配置（秒）
const TIME_CONFIG = {
  thinking: 180, // 审题3分钟
  answeringPerQuestion: 180, // 每题3分钟
}

// 从题库随机抽取每类型一道题
function getRandomQuestions(allQuestions: any[]): any[] {
  const result: any[] = []
  for (const qt of QUESTION_TYPES) {
    const typeQuestions = allQuestions.filter(q => q.type === qt.type)
    if (typeQuestions.length > 0) {
      const randomIdx = Math.floor(Math.random() * typeQuestions.length)
      result.push({
        ...typeQuestions[randomIdx],
        typeLabel: qt.name,
        order: qt.order
      })
    }
  }
  return result.sort((a, b) => a.order - b.order)
}

export default function SimulatePage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [textAnswers, setTextAnswers] = useState<string[]>(['', '', '', '']) // 文字答案
  const [currentAnswer, setCurrentAnswer] = useState('')
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recorderManagerRef = useRef<any>(null)
  const recordingsRef = useRef<string[]>([])
  
  // 检测是否在小程序环境
  const isMiniApp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP || Taro.getEnv() === Taro.ENV_TYPE.TT

  // 加载随机题目
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true)
      try {
        const res = await Network.request({ url: '/api/questions' })
        const allQuestions = res.data?.data || []
        if (allQuestions.length > 0) {
          const randomQuestions = getRandomQuestions(allQuestions)
          setQuestions(randomQuestions)
          // 初始化答案数组
          setTextAnswers(new Array(randomQuestions.length).fill(''))
        }
      } catch (err) {
        console.error('加载题目失败:', err)
        Taro.showToast({ title: '加载题目失败', icon: 'error' })
      } finally {
        setLoadingQuestions(false)
      }
    }
    loadQuestions()
  }, [])

  // 初始化录音管理器
  useEffect(() => {
    if (isMiniApp) {
      recorderManagerRef.current = Taro.getRecorderManager()
      recorderManagerRef.current.onStop((res: any) => {
        recordingsRef.current.push(res.tempFilePath)
        console.log('录音完成:', res.tempFilePath)
      })
      recorderManagerRef.current.onError((err: any) => {
        console.error('录音错误:', err)
        setIsRecording(false)
      })
    }
  }, [isMiniApp])

  // 开始计时
  const startTimer = useCallback((seconds: number, onComplete: () => void) => {
    setTimeLeft(seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // 停止计时
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 开始录音
  const startRecording = useCallback(() => {
    if (isMiniApp && recorderManagerRef.current) {
      recorderManagerRef.current.start({
        format: 'mp3',
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
      })
      setIsRecording(true)
    } else {
      Taro.showToast({ title: '录音功能仅在小程序可用', icon: 'none' })
    }
  }, [isMiniApp])

  // 停止录音
  const stopRecording = useCallback(() => {
    if (isMiniApp && recorderManagerRef.current) {
      recorderManagerRef.current.stop()
      setIsRecording(false)
    }
  }, [isMiniApp])

  // 开始审题阶段
  const handleStartThinking = useCallback(() => {
    setPhase('thinking')
    startTimer(TIME_CONFIG.thinking, () => {
      Taro.showToast({ title: '审题时间结束，请开始答题', icon: 'none' })
      setCurrentQuestionIndex(0)
      setPhase('answering')
      startTimer(TIME_CONFIG.answeringPerQuestion, () => {
        handleQuestionComplete()
      })
    })
  }, [startTimer])

  // 开始答题阶段
  const handleStartAnswering = useCallback(() => {
    stopTimer()
    setPhase('answering')
    setCurrentQuestionIndex(0)
    startRecording()
    startTimer(TIME_CONFIG.answeringPerQuestion, () => {
      handleQuestionComplete()
    })
  }, [stopTimer, startRecording, startTimer])

  // 题目完成
  const handleQuestionComplete = useCallback(async () => {
    stopRecording()
    stopTimer()
    
    // 保存当前题目的文字答案（H5环境）
    if (!isMiniApp && currentAnswer.trim()) {
      const newAnswers = [...textAnswers]
      newAnswers[currentQuestionIndex] = currentAnswer.trim()
      setTextAnswers(newAnswers)
      setCurrentAnswer('')
    }
    
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setPhase('answering')
      // 等待1秒后开始下一题
      setTimeout(() => {
        if (isMiniApp) {
          startRecording()
        }
        startTimer(TIME_CONFIG.answeringPerQuestion, () => {
          handleQuestionComplete()
        })
      }, 1000)
    } else {
      // 所有题目完成
      setPhase('summary')
      Taro.showToast({ title: '面试结束', icon: 'success' })
    }
  }, [currentQuestionIndex, stopRecording, stopTimer, startRecording, startTimer, isMiniApp, currentAnswer, textAnswers])

  // 提前结束当前题目
  const handleSkipQuestion = useCallback(() => {
    stopRecording()
    stopTimer()
    
    // 保存当前题目的文字答案（H5环境）
    if (!isMiniApp && currentAnswer.trim()) {
      const newAnswers = [...textAnswers]
      newAnswers[currentQuestionIndex] = currentAnswer.trim()
      setTextAnswers(newAnswers)
      setCurrentAnswer('')
    }
    
    handleQuestionComplete()
  }, [stopRecording, stopTimer, handleQuestionComplete, isMiniApp, currentAnswer, textAnswers])

  // 提交评分
  const handleSubmitScore = useCallback(async () => {
    // 检查是否有答案内容
    const hasAnswers = isMiniApp 
      ? recordingsRef.current.length > 0 
      : textAnswers.some(a => a.trim().length > 0)
    
    if (!hasAnswers) {
      Taro.showToast({ 
        title: '请先答题再获取评分', 
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    setLoading(true)
    try {
      // H5环境使用文字答案，小程序环境使用录音
      const res = await Network.request({
        url: '/api/interview/simulate-score',
        method: 'POST',
        data: {
          questions: questions,
          recordings: isMiniApp ? recordingsRef.current : [],
          answers: isMiniApp ? [] : textAnswers,
          sessionId: Date.now().toString()
        }
      })
      console.log('评分结果:', res.data)
      if (res.data?.data?.reportId) {
        Taro.navigateTo({ url: `/pages/report/index?id=${res.data.data.reportId}` })
      }
    } catch (err) {
      console.error('提交失败:', err)
      Taro.showToast({ title: '提交失败', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }, [questions, isMiniApp, textAnswers])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取进度百分比
  const getProgressPercent = () => {
    if (phase === 'thinking') {
      return ((TIME_CONFIG.thinking - timeLeft) / TIME_CONFIG.thinking) * 100
    }
    if (phase === 'answering') {
      const totalTime = 4 * TIME_CONFIG.answeringPerQuestion
      const usedTime = currentQuestionIndex * TIME_CONFIG.answeringPerQuestion + 
                       (TIME_CONFIG.answeringPerQuestion - timeLeft)
      return (usedTime / totalTime) * 100
    }
    return 100
  }

  // 阶段标题
  const getPhaseTitle = () => {
    switch (phase) {
      case 'intro': return '面试准备'
      case 'thinking': return '审题阶段'
      case 'answering': return `答题阶段 - 第${currentQuestionIndex + 1}题`
      case 'summary': return '面试结束'
      case 'report': return '评分报告'
      default: return ''
    }
  }

  // 面试开场白
  const introText = `考生，你好！欢迎你参加今天的面试。本次面试时间为15分钟，共四道题，其中审题时间3分钟，答题时间12分钟，每道题答题时间为3分钟，我不再读题。希望你能认真和实事求是地回答。请不要在面试过程中提及你的个人身份信息，每回答完一道题，请说"回答完毕"，请不要在题签上涂写，你可以在草稿纸上书写答题要点。请你注意把握时间，听清楚了吗？

好，现在开始审题，时间3分钟，请计时员开始计时。`

  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部状态栏 */}
      <View className="bg-blue-600 px-4 py-3 flex items-center justify-between">
        <Text className="text-white font-semibold text-lg">{getPhaseTitle()}</Text>
        {phase !== 'intro' && (
          <View className="flex items-center">
            <Timer size={20} color="#fff" />
            <Text className="text-white ml-2 text-xl font-bold">{formatTime(timeLeft)}</Text>
          </View>
        )}
      </View>

      {/* 进度条 */}
      {phase !== 'intro' && phase !== 'summary' && (
        <View className="px-4 py-2 bg-white">
          <Progress value={getProgressPercent()} className="h-2" />
          <View className="flex justify-between mt-2">
            {QUESTION_TYPES.map((_, idx) => (
              <Badge 
                key={idx} 
                variant={idx <= currentQuestionIndex ? 'default' : 'outline'}
                className="text-xs"
              >
                题{idx + 1}
              </Badge>
            ))}
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-4 py-4">
        {/* 面试开场白 */}
        {phase === 'intro' && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex items-center">
                <Info size={20} color="#2563eb" className="mr-2" />
                <Text className="font-semibold text-gray-900">面试流程说明</Text>
              </View>
            </CardHeader>
            <CardContent>
              {loadingQuestions ? (
                <Text className="block text-gray-500 text-center py-4">正在加载题目...</Text>
              ) : questions.length < 4 ? (
                <Text className="block text-red-500 text-center py-4">题库题目不足，无法开始模拟面试</Text>
              ) : (
                <Text className="block text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{introText}</Text>
              )}
            </CardContent>
          </Card>
        )}

        {/* 题目展示 */}
        {(phase === 'thinking' || phase === 'answering') && questions.length > 0 && (
          <View className="space-y-4">
            {questions.map((q, idx) => (
              <Card 
                key={q.id} 
                className={`${idx === currentQuestionIndex && phase === 'answering' ? 'border-2 border-blue-500' : ''}`}
              >
                <CardHeader>
                  <View className="flex items-center justify-between">
                    <Badge variant={idx === currentQuestionIndex ? 'default' : 'outline'}>
                      {q.typeLabel || QUESTION_TYPES.find(t => t.type === q.type)?.name || '未知类型'}
                    </Badge>
                    {idx === currentQuestionIndex && phase === 'answering' && (
                      <View className="flex items-center">
                        <Mic size={16} color={isRecording ? '#22c55e' : '#ef4444'} />
                        <Text className="ml-1 text-sm text-gray-500">
                          {isRecording ? '录音中' : '已暂停'}
                        </Text>
                      </View>
                    )}
                  </View>
                </CardHeader>
                <CardContent>
                  <View className="flex items-start">
                    <Text className="text-gray-500 mr-2">题目{idx + 1}：</Text>
                    <Text className="text-gray-900 flex-1">{q.title}</Text>
                  </View>
                  {idx === currentQuestionIndex && phase === 'answering' && (
                    <View className="mt-4">
                      {isMiniApp ? (
                        <View className="flex items-center">
                          <Volume2 size={16} color="#2563eb" />
                          <Text className="ml-2 text-sm text-blue-600">正在答题，请说回答完毕后点击结束</Text>
                        </View>
                      ) : (
                        <View className="flex flex-col gap-2">
                          <View className="flex items-center">
                            <PenLine size={16} color="#2563eb" />
                            <Text className="ml-2 text-sm text-blue-600">请输入您的答案（H5暂不支持录音）</Text>
                          </View>
                          <Textarea
                            className="bg-gray-50 rounded-lg p-3 mt-2"
                            style={{ width: '100%', minHeight: '120px' }}
                            placeholder="在此输入您的答案内容..."
                            value={currentAnswer}
                            onInput={(e) => setCurrentAnswer(e.detail.value)}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* 面试结束 */}
        {phase === 'summary' && (
          <Card>
            <CardContent className="py-8 text-center">
              <Text className="block text-2xl font-bold text-green-600 mb-4">面试结束</Text>
              <Text className="block text-gray-600 mb-2">你已完成全部四道题目的答题</Text>
              <Text className="block text-gray-500 text-sm">答题录音已保存，点击下方按钮获取AI评分报告</Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 100
      }}
      >
        {/* 面试开场阶段 */}
        {phase === 'intro' && (
          <>
            <View style={{ flex: 1 }}>
              <Button variant="outline" className="w-full" onClick={() => Taro.navigateBack()}>
                返回首页
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button className="w-full bg-blue-600" onClick={handleStartThinking}>
                <Play size={18} color="#fff" />
                <Text className="ml-2 text-white">开始审题</Text>
              </Button>
            </View>
          </>
        )}

        {/* 审题阶段 */}
        {phase === 'thinking' && (
          <>
            <View style={{ flex: 1 }}>
              <Button variant="outline" className="w-full" onClick={() => {
                stopTimer()
                Taro.navigateBack()
              }}
              >
                退出模拟
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button className="w-full bg-green-600" onClick={handleStartAnswering}>
                <ChevronRight size={18} color="#fff" />
                <Text className="ml-2 text-white">开始答题</Text>
              </Button>
            </View>
          </>
        )}

        {/* 答题阶段 */}
        {phase === 'answering' && (
          <>
            <View style={{ flex: 1 }}>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  if (isRecording) {
                    stopRecording()
                  } else {
                    startRecording()
                  }
                }}
              >
                {isRecording ? <MicOff size={18} color="#fff" /> : <Mic size={18} color="#fff" />}
                <Text className="ml-1">{isRecording ? '暂停录音' : '继续录音'}</Text>
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button className="w-full bg-orange-500" onClick={handleSkipQuestion}>
                <Square size={18} color="#fff" />
                <Text className="ml-2 text-white">本题回答完毕</Text>
              </Button>
            </View>
          </>
        )}

        {/* 面试结束 */}
        {phase === 'summary' && (
          <>
            <View style={{ flex: 1 }}>
              <Button variant="outline" className="w-full" onClick={() => Taro.navigateBack()}>
                返回首页
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button className="w-full bg-blue-600" onClick={handleSubmitScore} disabled={loading}>
                {loading ? (
                  <Text className="text-white">正在生成报告...</Text>
                ) : (
                  <>
                    <ChevronRight size={18} color="#fff" />
                    <Text className="ml-2 text-white">获取评分报告</Text>
                  </>
                )}
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  )
}