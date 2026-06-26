import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KeyRound, Gift, CircleCheck, TriangleAlert } from 'lucide-react-taro'
import { Network } from '@/network'

export default function ActivatePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    memberType?: string
    endDate?: string
    freeReviews?: number
  } | null>(null)

  const handleActivate = async () => {
    if (!code.trim()) {
      Taro.showToast({ title: '请输入访问码', icon: 'none' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await Network.request({
        url: '/api/access-code/activate',
        method: 'POST',
        data: { code: code.trim().toUpperCase() }
      })

      console.log('激活结果:', res.data)

      if (res.data.code === 200) {
        setResult({
          success: true,
          message: '会员激活成功！',
          memberType: res.data.data.memberType,
          endDate: res.data.data.endDate,
          freeReviews: res.data.data.freeReviews
        })
        Taro.showToast({ title: '激活成功！', icon: 'success' })
      } else {
        setResult({
          success: false,
          message: res.data.msg || '激活失败，请检查访问码'
        })
        Taro.showToast({ title: res.data.msg || '激活失败', icon: 'none' })
      }
    } catch (err) {
      console.error('激活错误:', err)
      setResult({
        success: false,
        message: '网络错误，请稍后重试'
      })
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getMemberTypeText = (type: string) => {
    const map: Record<string, string> = {
      monthly: '月卡会员',
      quarterly: '季卡会员',
      yearly: '年卡会员',
      single_review: '单次人工点评'
    }
    return map[type] || type
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 说明卡片 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="flex flex-row items-center mb-3">
            <KeyRound size={24} color="#2563eb" className="mr-2" />
            <Text className="text-lg font-semibold text-gray-800">访问码激活</Text>
          </View>
          <Text className="text-sm text-gray-600 leading-relaxed">
            通过知识星球、小鹅通等平台付费后，管理员会发放专属访问码。在此输入访问码即可激活会员权益。
          </Text>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Text className="text-sm text-gray-500 mb-2">请输入您的访问码</Text>
          <View className="bg-white rounded-lg border border-gray-200 px-3 py-2 mb-4">
            <Input
              className="w-full bg-transparent text-lg"
              placeholder="例如：ABCD1234"
              value={code}
              onInput={(e) => setCode(e.detail.value.toUpperCase())}
              maxlength={20}
            />
          </View>
          <Button
            className="w-full"
            disabled={loading || !code.trim()}
            onClick={handleActivate}
          >
            <Text className="text-white font-medium">{loading ? '激活中...' : '立即激活'}</Text>
          </Button>
        </CardContent>
      </Card>

      {/* 激活结果 */}
      {result && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex flex-row items-center mb-3">
              {result.success ? (
                <CircleCheck size={24} color="#16a34a" className="mr-2" />
              ) : (
                <TriangleAlert size={24} color="#dc2626" className="mr-2" />
              )}
              <Text className={`text-lg font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </Text>
            </View>
            {result.success && result.memberType && (
              <View className="bg-green-50 rounded-lg p-3">
                <View className="flex flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">会员类型</Text>
                  <Badge className="bg-blue-500 text-white">
                    <Text className="text-xs">{getMemberTypeText(result.memberType)}</Text>
                  </Badge>
                </View>
                {result.endDate && (
                  <View className="flex flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600">有效期至</Text>
                    <Text className="text-sm font-medium text-gray-800">{result.endDate}</Text>
                  </View>
                )}
                {result.freeReviews && result.freeReviews > 0 && (
                  <View className="flex flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">赠送人工点评</Text>
                    <View className="flex flex-row items-center">
                      <Gift size={16} color="#f59e0b" className="mr-1" />
                      <Text className="text-sm font-medium text-orange-600">{result.freeReviews}次</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {/* 获取访问码说明 */}
      <Card>
        <CardContent className="p-4">
          <Text className="text-sm font-medium text-gray-800 mb-3">如何获取访问码？</Text>
          <View className="space-y-2">
            <View className="flex flex-row items-start">
              <Text className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mr-2">1</Text>
              <Text className="text-sm text-gray-600 flex-1">
                在知识星球/小鹅通平台付费购买会员套餐
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mr-2">2</Text>
              <Text className="text-sm text-gray-600 flex-1">
                付费成功后联系管理员获取专属访问码
              </Text>
            </View>
            <View className="flex flex-row items-start">
              <Text className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mr-2">3</Text>
              <Text className="text-sm text-gray-600 flex-1">
                在此页面输入访问码，即刻激活会员权益
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}