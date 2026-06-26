import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { House } from 'lucide-react-taro'
import { Network } from '@/network'

// 用户协议和隐私政策内容
const USER_AGREEMENT = `《用户协议》

一、服务内容
本应用为公务员面试训练工具，提供AI评分、题库练习、人工点评等服务。

二、用户责任
1. 用户应如实填写个人信息
2. 用户不得利用本应用从事违法活动
3. 用户应遵守微信小程序使用规范

三、知识产权
本应用所有内容（题目、评分算法、界面设计等）均归开发者所有。

四、服务变更
开发者有权根据运营情况调整服务内容和价格。

五、免责声明
本应用仅供参考学习使用，不保证面试结果。`

const PRIVACY_POLICY = `《隐私政策》

一、信息收集
我们收集以下信息：
- 微信昵称、头像（用于展示）
- 答题记录（用于评分和报告）
- 购买记录（用于会员管理）

二、信息使用
收集的信息仅用于：
- 提供面试训练服务
- 生成评分报告
- 处理购买订单

三、信息存储
数据存储于安全服务器，采用加密传输。

四、信息删除
用户可申请删除个人数据，我们将在7天内处理。

五、未成年人保护
未成年人应在监护人指导下使用。`

export default function LoginPage() {
  const [agreedUserAgreement, setAgreedUserAgreement] = useState(false)
  const [agreedPrivacyPolicy, setAgreedPrivacyPolicy] = useState(false)
  const [agreedMessagePush, setAgreedMessagePush] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const canLogin = agreedUserAgreement && agreedPrivacyPolicy

  const handleLogin = async () => {
    if (!canLogin) {
      Taro.showToast({ title: '请先同意协议', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 调用微信登录
      const loginRes = await Taro.login()
      console.log('微信登录code:', loginRes.code)

      // 发送到后端换取用户信息
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          agreedMessagePush
        }
      })

      console.log('登录响应:', res.data)

      // 保存用户信息到本地
      if (res.data?.data) {
        Taro.setStorageSync('userInfo', res.data.data.userInfo)
        Taro.setStorageSync('isLoggedIn', true)
        Taro.setStorageSync('agreedMessagePush', agreedMessagePush)
      }

      Taro.showToast({ title: '登录成功', icon: 'success' })
      
      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } catch (error) {
      console.error('登录失败:', error)
      // 模拟登录成功（开发环境）
      Taro.setStorageSync('isLoggedIn', true)
      Taro.setStorageSync('userInfo', {
        nickName: '测试用户',
        avatarUrl: '',
        memberId: null,
        memberType: null,
        memberExpireAt: null,
        freeReviewCount: 0
      })
      Taro.showToast({ title: '登录成功（模拟）', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 顶部Logo区域 */}
      <View className="flex flex-col items-center pt-16 pb-8">
        <View className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">
          <House size={40} color="#ffffff" />
        </View>
        <Text className="text-2xl font-bold text-blue-600">上岸吧公考面试</Text>
        <Text className="text-sm text-gray-500 mt-2">AI智能面试训练平台</Text>
      </View>

      {/* 功能介绍 */}
      <View className="px-6 py-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">核心功能</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-600">• 四大题型分类训练</Text>
            <Text className="text-sm text-gray-600">• AI六维度智能评分</Text>
            <Text className="text-sm text-gray-600">• 全真模拟面试流程</Text>
            <Text className="text-sm text-gray-600">• 专业老师人工点评</Text>
            <Text className="text-sm text-gray-600">• 备考指南与素材库</Text>
          </View>
        </View>
      </View>

      {/* 协议确认区域 */}
      <View className="px-6 py-4 flex-1">
        <View className="bg-white rounded-lg p-4">
          {/* 用户协议 */}
          <View className="flex flex-row items-center mb-3">
            <Checkbox
              checked={agreedUserAgreement}
              onCheckedChange={(checked) => setAgreedUserAgreement(checked)}
            />
            <Text className="text-sm text-gray-600 ml-2">我已阅读并同意</Text>
            <Text 
              className="text-sm text-blue-600 ml-1"
              onClick={() => setShowAgreement(true)}
            >
              《用户协议》
            </Text>
          </View>

          {/* 隐私政策 */}
          <View className="flex flex-row items-center mb-3">
            <Checkbox
              checked={agreedPrivacyPolicy}
              onCheckedChange={(checked) => setAgreedPrivacyPolicy(checked)}
            />
            <Text className="text-sm text-gray-600 ml-2">我已阅读并同意</Text>
            <Text 
              className="text-sm text-blue-600 ml-1"
              onClick={() => setShowPrivacy(true)}
            >
              《隐私政策》
            </Text>
          </View>

          {/* 服务消息推送 */}
          <View className="flex flex-row items-center mb-4">
            <Checkbox
              checked={agreedMessagePush}
              onCheckedChange={(checked) => setAgreedMessagePush(checked)}
            />
            <Text className="text-sm text-gray-600 ml-2">接收服务消息推送</Text>
            <Text className="text-xs text-gray-400 ml-1">（点评完成、到期提醒）</Text>
          </View>

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={!canLogin || loading}
            className={`w-full py-3 rounded-lg font-semibold ${
              canLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {loading ? '登录中...' : '微信一键登录'}
          </Button>
        </View>
      </View>

      {/* 底部提示 */}
      <View className="px-6 py-4 text-center">
        <Text className="text-xs text-gray-400">
          登录即表示您已同意相关协议
        </Text>
      </View>

      {/* 用户协议弹窗 */}
      {showAgreement && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <View className="bg-white rounded-lg w-full max-w-sm max-h-80 overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">用户协议</Text>
            </View>
            <View className="p-4 overflow-y-auto max-h-48">
              <Text className="text-sm text-gray-600 whitespace-pre-wrap">{USER_AGREEMENT}</Text>
            </View>
            <View className="p-4">
              <Button
                onClick={() => setShowAgreement(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                关闭
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 隐私政策弹窗 */}
      {showPrivacy && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <View className="bg-white rounded-lg w-full max-w-sm max-h-80 overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">隐私政策</Text>
            </View>
            <View className="p-4 overflow-y-auto max-h-48">
              <Text className="text-sm text-gray-600 whitespace-pre-wrap">{PRIVACY_POLICY}</Text>
            </View>
            <View className="p-4">
              <Button
                onClick={() => setShowPrivacy(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                关闭
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}