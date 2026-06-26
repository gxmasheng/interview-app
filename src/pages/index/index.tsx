import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  House,
  Target,
  Clock,
  TrendingUp,
  Crown,
  BookOpen,
  ChevronRight,
  Megaphone,
  CircleAlert,
  Headphones,
} from 'lucide-react-taro'

// 背景图片 URL（从 TOS 获取）
const BACKGROUND_IMAGE_URL = 'https://coze-coding-project.tos.coze.site/coze_storage_7652175166046371881/proxy_9d5096bf?sign=1784772990-99c8f7aea5-0-1325f7a86e8cbca1040a5ff7afb7bb859f3b6d1436ce6daeabf9e6b4fc41b2fe'

// 模拟会员状态（实际应用中需要从后端获取）
const useMemberStatus = () => {
  // 从本地存储获取会员状态
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    try {
      const memberStatus = Taro.getStorageSync('isMember')
      setIsMember(memberStatus === true)
    } catch (e) {
      console.log('获取会员状态失败')
    }
  }, [])

  return { isMember, setIsMember }
}

// 模拟每日答题次数（实际应用中需要从后端获取）
const useDailyAnswerCount = () => {
  const [count, setCount] = useState(3)
  const MAX_FREE_COUNT = 5 // 非会员每日最多5题

  useEffect(() => {
    try {
      const today = new Date().toDateString()
      const savedDate = Taro.getStorageSync('answerDate')
      const savedCount = Taro.getStorageSync('answerCount')

      if (savedDate === today) {
        setCount(savedCount || 0)
      } else {
        // 新的一天，重置计数
        Taro.setStorageSync('answerDate', today)
        Taro.setStorageSync('answerCount', 0)
        setCount(0)
      }
    } catch (e) {
      console.log('获取答题次数失败')
    }
  }, [])

  return { count, maxCount: MAX_FREE_COUNT }
}

const IndexPage: FC = () => {
  const { isMember } = useMemberStatus()
  const { count, maxCount } = useDailyAnswerCount()

  // 剩余答题次数
  const remainingCount = isMember ? '无限' : maxCount - count

  // 跳转答题页
  const goToAnswer = (questionId?: number) => {
    if (!isMember && count >= maxCount) {
      // 非会员已达到每日上限
      Taro.showModal({
        title: '答题次数已用完',
        content: `今日答题次数已达上限（${maxCount}题），开通会员可无限答题`,
        confirmText: '开通会员',
        cancelText: '明天再来',
      }).then((res) => {
        if (res.confirm) {
          Taro.navigateTo({ url: '/pages/member/index' })
        }
      })
      return
    }
    Taro.navigateTo({
      url: questionId
        ? `/pages/answer/index?id=${questionId}`
        : '/pages/questions/index',
    })
  }

  // 跳转备考指南
  const goToGuide = () => {
    Taro.navigateTo({ url: '/pages/guide/index' })
  }

  // 跳转会员页
  const goToMember = () => {
    Taro.navigateTo({ url: '/pages/member/index' })
  }

  // 跳转全真模拟
  const goToSimulate = () => {
    Taro.navigateTo({ url: '/pages/simulate/index' })
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部背景图区域 */}
      <View className="relative h-48 overflow-hidden">
        <Image
          src={BACKGROUND_IMAGE_URL}
          mode="aspectFill"
          className="w-full h-full absolute top-0 left-0"
        />
        {/* 渐变遮罩 */}
        <View 
          className="absolute top-0 left-0 right-0 bottom-0" 
          style={{ background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.6), rgba(30, 64, 175, 0.8))' }}
        />
        {/* 内容 */}
        <View className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-4">
          <Text className="block text-2xl font-bold text-white mb-2">
            上岸吧公考面试
          </Text>
          <Text className="block text-sm text-white opacity-90">
            AI智能评分 · 专业点评反馈 · 系统提升能力
          </Text>
        </View>
      </View>

      {/* 公告滚动 */}
      <View className="mx-4 -mt-2 bg-white rounded-lg shadow-sm border border-gray-100 relative z-10">
        <View className="flex items-center px-3 py-2">
          <Megaphone size={18} color="#2563eb" className="mr-2" />
          <View className="flex-1 overflow-hidden">
            <View 
              className="animate-marquee whitespace-nowrap"
              style={{
                animation: 'marquee 15s linear infinite',
              }}
            >
              <Text className="text-sm text-gray-600 inline-block mr-8">
                📢 系统公告：公务员面试AI训练系统已上线，欢迎体验全真模拟面试功能！
              </Text>
              <Text className="text-sm text-gray-600 inline-block mr-8">
                🔥 新功能：人工点评服务已开放，专业老师一对一指导！
              </Text>
              <Text className="text-sm text-gray-600 inline-block mr-8">
                💡 温馨提示：每日免费答题次数为3题，开通会员可无限使用！
              </Text>
              <Text className="text-sm text-gray-600 inline-block mr-8">
                📢 系统公告：公务员面试AI训练系统已上线，欢迎体验全真模拟面试功能！
              </Text>
              <Text className="text-sm text-gray-600 inline-block mr-8">
                🔥 新功能：人工点评服务已开放，专业老师一对一指导！
              </Text>
              <Text className="text-sm text-gray-600 inline-block mr-8">
                💡 温馨提示：每日免费答题次数为3题，开通会员可无限使用！
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 内容区域 */}
      <View className="p-4 relative">
        {/* 会员入口 */}
        {!isMember && (
          <Card
            className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden"
            onClick={goToMember}
          >
            <CardContent className="p-4">
              <View className="flex items-center justify-between">
                <View className="flex items-center">
                  <Crown size={28} color="#fff" className="mr-3" />
                  <View>
                    <Text className="block text-white font-bold text-base">
                      开通会员
                    </Text>
                    <Text className="block text-white text-xs opacity-80">
                      无限答题 · 完整指南 · 素材下载
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#fff" />
              </View>
            </CardContent>
          </Card>
        )}

        {/* 备考指南入口 */}
        <Card className="mb-4" onClick={goToGuide}>
          <CardContent className="p-4">
            <View className="flex items-center justify-between">
              <View className="flex items-center">
                <BookOpen size={24} color="#2563eb" className="mr-3" />
                <View>
                  <Text className="block text-base font-medium text-gray-900">
                    备考指南
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    流程 · 评分 · 技巧 · 素材 · 案例
                  </Text>
                </View>
              </View>
              <Badge variant={isMember ? 'default' : 'secondary'}>
                {isMember ? '完整版' : '预览版'}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* 答题次数提示 */}
        <View className="flex items-center mb-4 px-1">
          <CircleAlert
            size={16}
            color={isMember ? '#2563eb' : '#f59e0b'}
            className="mr-2"
          />
          <Text className="block text-sm text-gray-600">
            今日剩余答题次数：
            <Text className={`font-semibold ${isMember ? 'text-blue-600' : 'text-amber-500'}`}>
              {remainingCount}
            </Text>
            {remainingCount === '无限' ? '' : ' 题'}
          </Text>
          {!isMember && (
            <Text
              className="block text-xs text-blue-600 ml-2"
              onClick={goToMember}
            >
              开通会员无限答题
            </Text>
          )}
        </View>

        {/* 快速入口 */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <Card className="cursor-pointer" onClick={() => goToAnswer()}>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Target size={32} color="#2563eb" />
              <Text className="block text-base font-medium text-gray-900 mt-2">
                单题练习
              </Text>
              <Text className="block text-xs text-gray-500 mt-1">
                针对性训练薄弱题型
              </Text>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={goToSimulate}>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Clock size={32} color="#2563eb" />
              <Text className="block text-base font-medium text-gray-900 mt-2">
                全真模拟
              </Text>
              <Text className="block text-xs text-gray-500 mt-1">
                还原真实面试流程
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* 人工点评入口 */}
        <Card 
          className="mb-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50"
          onClick={() => Taro.navigateTo({ url: '/pages/review/index' })}
        >
          <CardContent className="p-4">
            <View className="flex items-center justify-between">
              <View className="flex items-center">
                <Headphones size={28} color="#f97316" className="mr-3" />
                <View>
                  <View className="flex items-center">
                    <Text className="block text-base font-bold text-gray-900">
                      人工点评
                    </Text>
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">专业服务</Badge>
                  </View>
                  <Text className="block text-xs text-gray-500 mt-1">
                    上传视频 · 专业老师点评 · 24小时交付
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#f97316" />
            </View>
          </CardContent>
        </Card>

        {/* 今日训练进度 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <View className="flex items-center justify-between mb-2">
              <Text className="block text-sm text-gray-600">今日训练进度</Text>
              <Text className="block text-sm font-semibold text-blue-600">
                {count} 题
              </Text>
            </View>
            <Progress value={(count / 10) * 100} className="h-2 mb-2" />
            <View className="flex items-center justify-between">
              <Text className="block text-xs text-gray-500">目标：10 题/天</Text>
              <Text className="block text-xs text-blue-600">
                进度 {Math.round((count / 10) * 100)}%
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* 推荐题目 */}
        <View className="mb-4">
          <Text className="block text-lg font-semibold text-gray-900 mb-3">
            今日推荐题目
          </Text>
          <Card
            className="mb-3 cursor-pointer"
            onClick={() => goToAnswer(1)}
          >
            <CardContent className="p-4">
              <View className="flex items-start justify-between">
                <View className="flex-1">
                  <Badge className="mb-2" variant="default">综合分析</Badge>
                  <Text className="block text-base font-medium text-gray-900 mb-1">
                    当前社会上存在「躺平」现象，有人认为这是一种消极逃避，也有人认为这是年轻人的自我保护。请谈谈你的看法。
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    难度：中等 · 来源：2024年省考真题
                  </Text>
                </View>
                <TrendingUp size={20} color="#2563eb" className="ml-2" />
              </View>
            </CardContent>
          </Card>
          <Card
            className="mb-3 cursor-pointer"
            onClick={() => goToAnswer(3)}
          >
            <CardContent className="p-4">
              <View className="flex items-start justify-between">
                <View className="flex-1">
                  <Badge className="mb-2" variant="secondary">组织协调</Badge>
                  <Text className="block text-base font-medium text-gray-900 mb-1">
                    你是新入职的公务员，领导安排你组织一次单位内部的学习交流活动，你会如何组织？
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    难度：较易 · 来源：2023年市考真题
                  </Text>
                </View>
                <TrendingUp size={20} color="#2563eb" className="ml-2" />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 底部提示 */}
        <View className="flex items-center justify-center py-4">
          <House size={16} color="#9ca3af" className="mr-1" />
          <Text className="block text-xs text-gray-400">
            点击上方卡片开始答题
          </Text>
        </View>
      </View>
    </View>
  )
}

export default IndexPage