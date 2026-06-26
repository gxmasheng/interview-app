import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { APP_CONFIG } from '@/config/app.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Crown,
  CircleCheck,
  MessageCircle,
  Download,
  Infinity,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  Star,
  Headphones,
  Video,
} from 'lucide-react-taro'

// 会员权益列表
const MEMBER_BENEFITS = [
  {
    icon: Infinity,
    title: 'AI无限答题',
    desc: '每日不限次数AI评分训练',
    highlight: true,
  },
  {
    icon: Sparkles,
    title: '全题库解锁',
    desc: '完整真题库自由练习',
    highlight: true,
  },
  {
    icon: Headphones,
    title: '人工点评赠送',
    desc: '专业老师一对一视频点评',
    highlight: true,
  },
  {
    icon: BookOpen,
    title: '完整备考指南',
    desc: '6大板块内容完整解锁',
    highlight: false,
  },
  {
    icon: Download,
    title: '素材下载',
    desc: 'PDF素材库免费下载',
    highlight: false,
  },
  {
    icon: Users,
    title: '专属社群',
    desc: '加入会员学习交流群',
    highlight: false,
  },
]

// 会员套餐
const MEMBER_PLANS = [
  {
    id: 'monthly',
    name: '月卡',
    price: 29.9,
    period: '30天',
    freeReviews: 1,
    desc: 'AI全功能+全题库+赠1次人工点评',
  },
  {
    id: 'quarterly',
    name: '季卡',
    price: 59.9,
    period: '90天',
    freeReviews: 2,
    desc: 'AI全功能+全题库+赠2次人工点评',
    recommend: true,
    tag: '推荐',
  },
  {
    id: 'yearly',
    name: '年卡',
    price: 199.9,
    period: '365天',
    freeReviews: 6,
    desc: 'AI全功能+全题库+赠6次人工点评',
    tag: '超值',
  },
]

export default function MemberPage() {
  // 复制客服微信号
  const copyWechat = () => {
    Taro.setClipboardData({
      data: APP_CONFIG.SERVICE_WECHAT || 'gwyms2024',
    }).then(() => {
      Taro.showToast({
        title: '已复制客服微信号',
        icon: 'success',
      })
    })
  }

  // 查看会员状态
  const checkMemberStatus = () => {
    Taro.navigateTo({ url: '/pages/profile/index' })
  }

  return (
    <View className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 头部 */}
      <View className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 pt-6 pb-8">
        <View className="flex items-center justify-center mb-4">
          <Crown size={40} color="#fff" />
        </View>
        <Text className="block text-white text-2xl font-bold text-center mb-2">
          上岸吧公考面试会员
        </Text>
        <Text className="block text-white text-sm text-center opacity-80">
          AI训练· 人工点评 · 高分上岸
        </Text>
      </View>

      {/* 会员权益 */}
      <View className="px-4 -mt-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              <View className="flex items-center">
                <Star size={18} color="#2563eb" />
                <Text className="block ml-2">会员专属权益</Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="grid grid-cols-2 gap-3">
              {MEMBER_BENEFITS.map((benefit, idx) => (
                <View
                  key={idx}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: benefit.highlight ? '#eff6ff' : '#f9fafb' }}
                >
                  <View className="flex items-center mb-2">
                    <benefit.icon
                      size={20}
                      color={benefit.highlight ? '#2563eb' : '#6b7280'}
                    />
                    <Text className="block ml-2 text-sm font-medium text-gray-800">
                      {benefit.title}
                    </Text>
                  </View>
                  <Text className="block text-xs text-gray-500">{benefit.desc}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 套餐价格 */}
      <View className="px-4 mt-4">
        <Text className="block text-sm font-medium text-gray-700 mb-3">套餐价格</Text>
        <View className="space-y-2">
          {MEMBER_PLANS.map((plan) => (
            <View
              key={plan.id}
              className="rounded-lg p-3 border border-gray-200 bg-white"
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  {plan.tag && (
                    <Badge className="mr-2 bg-orange-500 text-white text-xs">
                      {plan.tag}
                    </Badge>
                  )}
                  <View>
                    <Text className="block text-sm font-medium text-gray-800">
                      {plan.name}
                    </Text>
                    <Text className="block text-xs text-gray-500">{plan.period}</Text>
                  </View>
                </View>
                <View className="flex flex-row items-baseline">
                  <Text className="block text-xl font-bold text-blue-600">
                    ¥{plan.price}
                  </Text>
                </View>
              </View>
              <View className="mt-2 flex flex-row items-center">
                <Headphones size={14} color="#2563eb" />
                <Text className="block ml-1 text-xs text-blue-600">
                  赠送 {plan.freeReviews} 次人工点评
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 联系客服开通会员 */}
      <View className="px-4 mt-6">
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="py-6">
            <View className="flex items-center justify-center mb-4">
              <MessageCircle size={48} color="#2563eb" />
            </View>
            
            <Text className="block text-lg font-bold text-gray-800 text-center mb-2">
              添加客服开通会员
            </Text>
            
            <Text className="block text-sm text-gray-600 text-center mb-4">
              扫码或搜索微信号添加客服，发送「会员开通」即可办理
            </Text>

            {/* 客服微信号 */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="block text-xs text-gray-500 mb-1">客服微信号</Text>
              <View className="flex items-center justify-between">
                <Text className="block text-lg font-bold text-blue-600">
                  {APP_CONFIG.SERVICE_WECHAT || 'gwyms2024'}
                </Text>
                <Button
                  size="sm"
                  onClick={copyWechat}
                >
                  <Text className="block text-xs">复制</Text>
                </Button>
              </View>
            </View>

            {/* 操作指引 */}
            <View className="bg-white rounded-lg p-3 mb-4">
              <Text className="block text-xs font-medium text-gray-700 mb-2">开通步骤：</Text>
              <View className="space-y-2">
                <View className="flex flex-row items-start">
                  <Text className="block text-xs text-blue-600 font-bold">1.</Text>
                  <Text className="block ml-1 text-xs text-gray-600">复制上方微信号，在微信搜索添加客服</Text>
                </View>
                <View className="flex flex-row items-start">
                  <Text className="block text-xs text-blue-600 font-bold">2.</Text>
                  <Text className="block ml-1 text-xs text-gray-600">发送「会员开通 +套餐类型」如「会员开通 月卡」</Text>
                </View>
                <View className="flex flex-row items-start">
                  <Text className="block text-xs text-blue-600 font-bold">3.</Text>
                  <Text className="block ml-1 text-xs text-gray-600">付款后客服立即开通，刷新页面即可生效</Text>
                </View>
              </View>
            </View>

            <Button
              className="w-full bg-blue-500 text-white"
              onClick={copyWechat}
            >
              <MessageCircle size={16} color="#fff" />
              <Text className="block ml-2 font-medium">复制客服微信号</Text>
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* 单次人工点评 */}
      <View className="px-4 mt-4">
        <Card className="border border-orange-200">
          <CardContent className="py-4">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Video size={24} color="#f97316" />
                <View className="ml-2">
                  <Text className="block text-sm font-medium text-gray-800">
                    单次人工点评
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    专业老师视频点评，24小时交付
                  </Text>
                </View>
              </View>
              <View className="flex flex-row items-center">
                <Text className="block text-xl font-bold text-orange-600">
                  ¥39
                </Text>
                <Text className="block text-xs text-gray-500">/次</Text>
              </View>
            </View>
            <View className="bg-orange-50 rounded-lg p-2 mt-3">
              <Text className="block text-xs text-orange-600 text-center">
                添加客服发送「人工点评」即可购买
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 人工点评说明 */}
      <View className="px-4 mt-4">
        <View className="bg-gray-50 rounded-lg p-4">
          <Text className="block text-sm font-medium text-gray-700 mb-2">人工点评服务说明</Text>
          <View className="space-y-2">
            <View className="flex flex-row items-start">
              <CircleCheck size={14} color="#2563eb" />
              <Text className="block ml-2 text-xs text-gray-600">
                上传答题视频，专业老师一对一点评
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <CircleCheck size={14} color="#2563eb" />
              <Text className="block ml-2 text-xs text-gray-600">
                六维度评分 + 分项点评 + 高分答题框架
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <CircleCheck size={14} color="#2563eb" />
              <Text className="block ml-2 text-xs text-gray-600">
                视频时间点标记 + 语音点评 + 永久可查
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <Clock size={14} color="#2563eb" />
              <Text className="block ml-2 text-xs text-gray-600">
                24小时内完成，超时自动转派其他老师
              </Text>
            </View>
          </View>
          
          <Separator className="mt-4 mb-3" />
          
          <Text className="block text-sm font-medium text-gray-700 mb-2">会员权益说明</Text>
          <View className="space-y-2">
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-gray-600">
                •会员有效期内，AI功能无限使用、题库完整解锁
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-gray-600">
                • 赠送的人工点评次数需在会员有效期内使用
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="block text-xs text-red-500 font-medium">
                • 会员到期后，未使用的赠送点评次数自动作废
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 查看会员状态 */}
      <View className="px-4 mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={checkMemberStatus}
        >
          <View className="flex items-center justify-center">
            <Crown size={16} color="#6b7280" />
            <Text className="block ml-2 text-gray-600">查看我的会员状态</Text>
          </View>
        </Button>
      </View>

      {/* 服务保障 */}
      <View className="px-4 mt-6 mb-8">
        <Text className="block text-sm font-medium text-gray-700 mb-3">服务保障</Text>
        <View className="flex justify-around">
          <View className="text-center">
            <CircleCheck size={24} color="#2563eb" />
            <Text className="block text-xs text-gray-600 mt-1">正版授权</Text>
          </View>
          <View className="text-center">
            <CircleCheck size={24} color="#2563eb" />
            <Text className="block text-xs text-gray-600 mt-1">售后保障</Text>
          </View>
          <View className="text-center">
            <CircleCheck size={24} color="#2563eb" />
            <Text className="block text-xs text-gray-600 mt-1">随时退订</Text>
          </View>
        </View>
      </View>
    </View>
  )
}