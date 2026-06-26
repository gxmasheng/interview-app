import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Video } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'
import { Calendar, ChevronRight, Play, Eye, Trash2, Award, Clock } from 'lucide-react-taro'

// 模拟记录
interface SimulateRecord {
  id: string
  date: string
  totalScore: number
  scores: Record<string, number>
  recordings: string[]
  duration: number // 总时长（秒）
}

// 倍速选项
const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1.0x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2 },
]

export default function HistoryPage() {
  const [records, setRecords] = useState<SimulateRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<SimulateRecord | null>(null)
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0)
  const [playSpeed, setPlaySpeed] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showPlayback, setShowPlayback] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await Network.request({
        url: '/api/interview/simulate-records',
      })
      if (res.data?.data) {
        setRecords(res.data.data)
      }
    } catch (err) {
      console.error('获取记录失败:', err)
      // 模拟数据用于演示
      setRecords([
        {
          id: '1',
          date: '2024-01-15 14:30',
          totalScore: 76,
          scores: { comprehensive: 15, organizational: 16, interpersonal: 14, emergency: 15 },
          recordings: [],
          duration: 720,
        },
        {
          id: '2',
          date: '2024-01-14 10:15',
          totalScore: 82,
          scores: { comprehensive: 17, organizational: 18, interpersonal: 15, emergency: 16 },
          recordings: [],
          duration: 680,
        },
        {
          id: '3',
          date: '2024-01-13 16:45',
          totalScore: 68,
          scores: { comprehensive: 12, organizational: 14, interpersonal: 13, emergency: 13 },
          recordings: [],
          duration: 750,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // 查看报告
  const handleViewReport = (record: SimulateRecord) => {
    Taro.navigateTo({ url: `/pages/report/index?id=${record.id}` })
  }

  // 播放录音/视频
  const handlePlayback = (record: SimulateRecord) => {
    setSelectedRecord(record)
    setCurrentRecordingIndex(0)
    setPlaySpeed(1)
    setShowPlayback(true)
  }

  // 删除记录
  const handleDelete = async (record: SimulateRecord) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/interview/simulate-records/${record.id}`,
              method: 'DELETE',
            })
            setRecords(records.filter(r => r.id !== record.id))
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      }
    })
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  // 获取分数等级颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <View className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Text className="text-gray-500">正在加载...</Text>
      </View>
    )
  }

  // 播放界面
  if (showPlayback && selectedRecord) {
    return (
      <View className="flex flex-col min-h-screen bg-gray-900">
        {/* 播放器头部 */}
        <View className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <Text className="text-white">答题回放 - {selectedRecord.date}</Text>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowPlayback(false)}
          >
            <Text className="text-white">关闭</Text>
          </Button>
        </View>

        {/* 播放器内容 */}
        <View className="flex-1 flex flex-col items-center justify-center">
          {selectedRecord.recordings.length > 0 ? (
            <Video
              src={selectedRecord.recordings[currentRecordingIndex]}
              className="w-full h-64"
              autoplay
              muted={false}
              showFullscreenBtn
              showPlayBtn
              showCenterPlayBtn
              enableProgressGesture
              onPlay={() => console.log('播放开始')}
              onPause={() => console.log('播放暂停')}
              onEnded={() => {
                if (currentRecordingIndex < selectedRecord.recordings.length - 1) {
                  setCurrentRecordingIndex(currentRecordingIndex + 1)
                }
              }}
            />
          ) : (
            <View className="flex flex-col items-center">
              <Play size={64} color="#fff" />
              <Text className="text-white mt-4">暂无录音文件</Text>
              <Text className="text-gray-400 text-sm mt-2">请在小程序中进行模拟面试以录制答题</Text>
            </View>
          )}
        </View>

        {/* 题目选择 */}
        {selectedRecord.recordings.length > 0 && (
          <View className="bg-gray-800 px-4 py-3">
            <View className="flex justify-between mb-3">
              {['综合分析', '组织协调', '人际沟通', '应急应变'].map((_name, i) => (
                <Badge
                  key={i}
                  variant={i === currentRecordingIndex ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setCurrentRecordingIndex(i)}
                >
                  题{i + 1}
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* 倍速选择 */}
        <View className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <Text className="text-gray-400">播放速度</Text>
          <View className="flex gap-2">
            {SPEED_OPTIONS.map(opt => (
              <Badge
                key={opt.value}
                variant={playSpeed === opt.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setPlaySpeed(opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </View>
        </View>
      </View>
    )
  }

  // 列表界面
  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 头部 */}
      <View className="bg-blue-600 px-4 py-4">
        <Text className="text-white font-semibold text-lg">模拟面试历史</Text>
        <Text className="text-white text-opacity-80 text-sm mt-1">共 {records.length} 次模拟记录</Text>
      </View>

      {/* 提示 */}
      <View className="bg-blue-50 px-4 py-3 flex items-center">
        <Calendar size={16} color="#2563eb" />
        <Text className="text-blue-600 text-sm ml-2">按日期排序，可查看报告、回放答题</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {records.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-16">
            <Clock size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">暂无模拟记录</Text>
            <Button 
              className="mt-4 bg-blue-600"
              onClick={() => Taro.navigateTo({ url: '/pages/simulate/index' })}
            >
              开始模拟面试
            </Button>
          </View>
        ) : (
          <View className="space-y-4">
            {records.map(record => (
              <Card key={record.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* 日期和分数 */}
                  <View className="bg-gradient-to-r from-blue-50 to-white px-4 py-3 flex items-center justify-between">
                    <View className="flex items-center">
                      <Calendar size={16} color="#2563eb" />
                      <Text className="text-gray-700 ml-2">{record.date}</Text>
                    </View>
                    <View className="flex items-center">
                      <Award size={16} color="#22c55e" />
                      <Text className={`font-bold ml-1 ${getScoreColor(record.totalScore)}`}>
                        {record.totalScore}分
                      </Text>
                    </View>
                  </View>

                  {/* 分数详情 */}
                  <View className="px-4 py-3 grid grid-cols-4 gap-2">
                    {['综合分析', '组织协调', '人际沟通', '应急应变'].map((name, i) => {
                      const keys = ['comprehensive', 'organizational', 'interpersonal', 'emergency']
                      const score = record.scores[keys[i]] || 0
                      return (
                        <View key={i} className="text-center">
                          <Text className="text-gray-500 text-xs">{name}</Text>
                          <Text className="font-bold text-sm">{score}/20</Text>
                        </View>
                      )
                    })}
                  </View>

                  {/* 时长 */}
                  <View className="px-4 py-2 bg-gray-50 flex items-center">
                    <Clock size={14} color="#9ca3af" />
                    <Text className="text-gray-500 text-sm ml-2">
                      答题时长：{formatDuration(record.duration)}
                    </Text>
                  </View>

                  {/* 操作按钮 */}
                  <View className="px-4 py-3 flex justify-between border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewReport(record)}
                    >
                      <Eye size={16} color="#2563eb" />
                      <Text className="ml-1">查看报告</Text>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePlayback(record)}
                    >
                      <Play size={16} color="#2563eb" />
                      <Text className="ml-1">播放录音</Text>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(record)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                      <Text className="ml-1 text-red-500">删除</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 100
      }}
      >
        <Button 
          className="w-full bg-blue-600"
          onClick={() => Taro.navigateTo({ url: '/pages/simulate/index' })}
        >
          <ChevronRight size={18} color="#fff" />
          <Text className="ml-2 text-white">开始新的模拟面试</Text>
        </Button>
      </View>
    </View>
  )
}