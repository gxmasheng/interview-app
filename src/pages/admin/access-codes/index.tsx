import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  KeyRound,
  Plus,
  Search,
  Trash2,
  CircleCheck,
  CircleX,
  Clock,
} from 'lucide-react-taro'
import { Network } from '@/network'

interface AccessCode {
  id: number
  code: string
  type: 'monthly' | 'quarterly' | 'annual' | 'review'
  status: 'unused' | 'used' | 'expired'
  createdAt: string
  usedAt?: string
  usedBy?: string
  expireAt?: string
}

export default function AdminAccessCodes() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await Network.request({
        url: '/api/access-code/admin/list',
      })
      console.log('获取访问码列表:', res.data)
      setCodes(res.data?.data || [])
    } catch (error) {
      console.error('获取访问码失败:', error)
      // 使用模拟数据
      setCodes([
        {
          id: 1,
          code: 'GK-2024-M-ABC123',
          type: 'monthly',
          status: 'unused',
          createdAt: '2024-06-18 10:30',
          expireAt: '2024-12-18',
        },
        {
          id: 2,
          code: 'GK-2024-Q-DEF456',
          type: 'quarterly',
          status: 'used',
          createdAt: '2024-06-15 14:20',
          usedAt: '2024-06-16 09:00',
          usedBy: '用户A',
        },
        {
          id: 3,
          code: 'GK-2024-Y-GHI789',
          type: 'annual',
          status: 'expired',
          createdAt: '2024-01-01 00:00',
          expireAt: '2024-06-01',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async (type: string, count: number) => {
    try {
      const res = await Network.request({
        url: '/api/access-code/admin/generate',
        method: 'POST',
        data: { type, count },
      })
      console.log('生成访问码:', res.data)
      Taro.showToast({ title: `成功生成${count}个访问码`, icon: 'success' })
      fetchCodes()
    } catch (error) {
      console.error('生成访问码失败:', error)
      Taro.showToast({ title: '生成失败', icon: 'error' })
    }
  }

  const deleteCode = async (id: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除此访问码吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/access-code/admin/delete/${id}`,
              method: 'DELETE',
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            fetchCodes()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      },
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unused':
        return {
          text: '未使用',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
        }
      case 'used':
        return {
          text: '已使用',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        }
      case 'expired':
        return {
          text: '已过期',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
        }
      default:
        return {
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        }
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return '月卡'
      case 'quarterly':
        return '季卡'
      case 'annual':
        return '年卡'
      case 'review':
        return '人工点评'
      default:
        return type
    }
  }

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || code.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 标题 */}
      <View className="mb-4">
        <Text className="block text-lg font-bold text-gray-800">访问码管理</Text>
        <Text className="block text-sm text-gray-500 mt-1">
          生成、发放和管理会员激活码
        </Text>
      </View>

      {/* 生成按钮组 */}
      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-2">批量生成</Text>
        <View className="flex flex-row gap-2">
          <Button
            size="sm"
            className="bg-green-500 text-white"
            onClick={() => generateCode('monthly', 10)}
          >
            <Plus size={14} color="#fff" />
            <Text className="block ml-1">月卡10个</Text>
          </Button>
          <Button
            size="sm"
            className="bg-blue-500 text-white"
            onClick={() => generateCode('quarterly', 10)}
          >
            <Plus size={14} color="#fff" />
            <Text className="block ml-1">季卡10个</Text>
          </Button>
          <Button
            size="sm"
            className="bg-purple-500 text-white"
            onClick={() => generateCode('annual', 5)}
          >
            <Plus size={14} color="#fff" />
            <Text className="block ml-1">年卡5个</Text>
          </Button>
          <Button
            size="sm"
            className="bg-orange-500 text-white"
            onClick={() => generateCode('review', 20)}
          >
            <Plus size={14} color="#fff" />
            <Text className="block ml-1">点评20个</Text>
          </Button>
        </View>
      </View>

      {/* 搜索和筛选 */}
      <View className="flex flex-row gap-2 mb-4">
        <View className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <View className="flex flex-row items-center">
            <Search size={16} color="#9ca3af" />
            <Text className="block ml-2 text-gray-400 text-sm">
              {searchQuery || '搜索访问码...'}
            </Text>
          </View>
        </View>
        <View className="flex flex-row gap-1">
          {['all', 'unused', 'used', 'expired'].map((status) => (
            <Button
              key={status}
              size="sm"
              className={`${
                filterStatus === status ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              <Text className="block text-xs">
                {status === 'all' ? '全部' : getStatusBadge(status).text}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      {/* 访问码列表 */}
      {loading ? (
        <View className="flex items-center justify-center py-8">
          <Text className="block text-gray-500">加载中...</Text>
        </View>
      ) : (
        <View className="space-y-2">
          {filteredCodes.map((code) => {
            const badge = getStatusBadge(code.status)
            return (
              <Card key={code.id}>
                <CardContent className="py-3">
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex flex-row items-center">
                        <KeyRound size={16} color="#6b7280" />
                        <Text className="block ml-2 font-mono text-sm text-gray-800">
                          {code.code}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center mt-1">
                        <Text className="block text-xs text-gray-500">
                          {getTypeLabel(code.type)}
                        </Text>
                        <View
                          className={`ml-2 px-2 py-1 rounded ${badge.bgColor} ${badge.textColor}`}
                        >
                          <Text className="block text-xs">{badge.text}</Text>
                        </View>
                      </View>
                      <Text className="block text-xs text-gray-400 mt-1">
                        创建: {code.createdAt}
                      </Text>
                      {code.usedAt && (
                        <Text className="block text-xs text-blue-500">
                          使用: {code.usedAt} ({code.usedBy})
                        </Text>
                      )}
                      {code.expireAt && code.status === 'unused' && (
                        <Text className="block text-xs text-orange-500">
                          有效期至: {code.expireAt}
                        </Text>
                      )}
                    </View>
                    {code.status === 'unused' && (
                      <Button
                        size="sm"
                        className="bg-red-50 text-red-600"
                        onClick={() => deleteCode(code.id)}
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </Button>
                    )}
                  </View>
                </CardContent>
              </Card>
            )
          })}
        </View>
      )}

      {/* 统计 */}
      <View className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
        <Text className="block text-sm font-medium text-gray-700 mb-2">统计</Text>
        <View className="flex flex-row justify-around">
          <View className="text-center">
            <CircleCheck size={24} color="#16a34a" />
            <Text className="block text-lg font-bold text-green-600 mt-1">
              {codes.filter((c) => c.status === 'unused').length}
            </Text>
            <Text className="block text-xs text-gray-500">未使用</Text>
          </View>
          <View className="text-center">
            <CircleX size={24} color="#2563eb" />
            <Text className="block text-lg font-bold text-blue-600 mt-1">
              {codes.filter((c) => c.status === 'used').length}
            </Text>
            <Text className="block text-xs text-gray-500">已使用</Text>
          </View>
          <View className="text-center">
            <Clock size={24} color="#dc2626" />
            <Text className="block text-lg font-bold text-red-600 mt-1">
              {codes.filter((c) => c.status === 'expired').length}
            </Text>
            <Text className="block text-xs text-gray-500">已过期</Text>
          </View>
        </View>
      </View>
    </View>
  )
}