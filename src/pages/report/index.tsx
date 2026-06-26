import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Network } from '@/network'
import { Share2, RotateCcw, TrendingUp, Award, Lightbulb, Target, FileText } from 'lucide-react-taro'

// 评分维度
const DIMENSIONS = [
  { name: '综合分析', key: 'comprehensive', max: 20 },
  { name: '组织协调', key: 'organizational', max: 20 },
  { name: '人际沟通', key: 'interpersonal', max: 20 },
  { name: '应急应变', key: 'emergency', max: 20 },
  { name: '语言表达', key: 'expression', max: 10 },
  { name: '举止仪表', key: 'appearance', max: 10 },
]

// 获取档次描述
const getLevelDesc = (score: number, max: number) => {
  if (max === 20) {
    if (score >= 16) return { level: '好', color: 'text-green-600', desc: '表现优秀，符合高分标准' }
    if (score >= 11) return { level: '中', color: 'text-blue-600', desc: '表现中等，仍有提升空间' }
    return { level: '差', color: 'text-red-600', desc: '需要重点加强训练' }
  }
  // 10分维度默认8分
  return { level: '合格', color: 'text-blue-600', desc: 'AI默认评分' }
}

// 雷达图SVG组件
const RadarChart = ({ scores }: { scores: Record<string, number> }) => {
  const centerX = 150
  const centerY = 150
  const radius = 100
  
  // 计算各维度点的坐标（六边形）
  const points = DIMENSIONS.map((dim, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180) // 从顶部开始，每60度一个点
    const value = scores[dim.key] || 0
    const r = (value / dim.max) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      labelX: centerX + (radius + 30) * Math.cos(angle),
      labelY: centerY + (radius + 30) * Math.sin(angle),
      name: dim.name,
      value: value,
      max: dim.max,
    }
  })

  // 背景六边形层级
  const backgroundLayers = [0.2, 0.4, 0.6, 0.8, 1]
  const backgroundPolygons = backgroundLayers.map(layer => 
    DIMENSIONS.map((_, i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180)
      const x = centerX + layer * radius * Math.cos(angle)
      const y = centerY + layer * radius * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')
  )

  // 数据多边形点
  const dataPolygon = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <View className="relative" style={{ width: '300px', height: '300px', margin: '0 auto' }}>
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 背景层 */}
        {backgroundPolygons.map((poly, i) => (
          <polygon
            key={i}
            points={poly}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {/* 轴线 */}
        {DIMENSIONS.map((_, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180)
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          )
        })}
        {/* 数据区域 */}
        <polygon
          points={dataPolygon}
          fill="rgba(37, 99, 235, 0.3)"
          stroke="#2563eb"
          strokeWidth="2"
        />
        {/* 数据点 */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#2563eb"
          />
        ))}
        {/* 标签 */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
          >
            {p.name}
          </text>
        ))}
      </svg>
    </View>
  )
}

export default function ReportPage() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReference, setShowReference] = useState(false)

  useEffect(() => {
    // 从URL参数获取报告ID
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}
    
    if (options.id) {
      fetchReport(options.id)
    } else {
      // 模拟数据用于演示
      setReport({
        id: 'demo',
        date: new Date().toLocaleString(),
        totalScore: 76,
        scores: {
          comprehensive: 15,
          organizational: 16,
          interpersonal: 14,
          emergency: 15,
          expression: 8,
          appearance: 8,
        },
        feedback: {
          comprehensive: {
            level: '中',
            points: ['观点基本明确，能够从正反两方面分析', '逻辑框架较为清晰', '建议：增加政策层面的深入分析'],
          },
          organizational: {
            level: '好',
            points: ['工作目标理解准确', '执行措施具体可行', '亮点：考虑了执行过程中可能遇到的问题'],
          },
          interpersonal: {
            level: '中',
            points: ['能体现换位思考意识', '沟通方式较为恰当', '建议：增加情感共鸣的表达'],
          },
          emergency: {
            level: '中',
            points: ['反应较为迅速', '处理思路基本清晰', '建议：细化具体操作步骤'],
          },
        },
        optimization: [
          '建议加强综合分析题的政策解读深度',
          '人际沟通类题目可以多运用"同理心"表达',
          '应急应变题建议按"稳秩序-解情绪-办好事-堵漏洞"逻辑展开',
        ],
        references: [
          {
            questionIndex: 1,
            type: '综合分析',
            framework: '表态（支持）→分析意义→指出问题→提出对策→总结升华',
            referenceAnswer: '这是一项便民利民的好政策...\n\n第一，从意义来看...\n\n第二，可能存在的问题...\n\n第三，建议...\n\n总之...',
          },
          {
            questionIndex: 2,
            type: '组织协调',
            framework: '明确目标→制定方案→组织实施→总结反馈',
            referenceAnswer: '我会按照以下步骤落实...\n\n一、明确工作目标...\n\n二、制定详细方案...\n\n三、组织实施...\n\n四、总结反馈...',
          },
          {
            questionIndex: 3,
            type: '人际沟通',
            framework: '理解对方→表达立场→提出方案→达成共识',
            referenceAnswer: '我会理解朋友的心情，但必须坚持原则...\n\n首先...\n\n其次...\n\n最后...',
          },
          {
            questionIndex: 4,
            type: '应急应变',
            framework: '稳住局面→安抚情绪→解决问题→堵塞漏洞',
            referenceAnswer: '面对这种情况，我会...\n\n第一，稳住局面...\n\n第二，安抚情绪...\n\n第三，解决问题...\n\n第四，堵塞漏洞...',
          },
        ],
      })
      setLoading(false)
    }
  }, [])

  const fetchReport = async (id: string) => {
    try {
      const res = await Network.request({
        url: `/api/interview/report/${id}`,
      })
      if (res.data?.data) {
        setReport(res.data.data)
      }
    } catch (err) {
      console.error('获取报告失败:', err)
      Taro.showToast({ title: '获取报告失败', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // 分享报告
  const handleShare = () => {
    // 微信小程序分享通过页面配置实现
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  // 重新模拟
  const handleRestart = () => {
    Taro.redirectTo({ url: '/pages/simulate/index' })
  }

  // 查看历史记录
  const handleViewHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' })
  }

  if (loading) {
    return (
      <View className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Text className="text-gray-500">正在加载报告...</Text>
      </View>
    )
  }

  if (!report) {
    return (
      <View className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Text className="text-gray-500">报告不存在</Text>
      </View>
    )
  }

  const totalScore = report.totalScore || 0
  const scoreLevel = totalScore >= 90 ? '优秀' : totalScore >= 80 ? '良好' : totalScore >= 60 ? '合格' : '需加强'

  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部总分展示 */}
      <View className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-6">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-white text-sm opacity-80">模拟面试评分报告</Text>
            <Text className="block text-white text-xs opacity-60 mt-1">{report.date}</Text>
          </View>
          <Badge variant="secondary" className="bg-white bg-opacity-20">
            <Award size={16} color="#fff" />
            <Text className="ml-1 text-white">{scoreLevel}</Text>
          </Badge>
        </View>
        
        <View className="flex items-center justify-center mt-6">
          <Text className="text-white text-6xl font-bold">{totalScore}</Text>
          <Text className="text-white text-2xl ml-2">分</Text>
        </View>
        <Text className="block text-white text-center text-sm opacity-80 mt-2">满分100分</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" style={{ paddingBottom: '80px' }}>
        {/* 雷达图 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center">
              <Target size={20} color="#2563eb" className="mr-2" />
              <Text className="font-semibold text-gray-900">六维度评分分析</Text>
            </View>
          </CardHeader>
          <CardContent>
            <RadarChart scores={report.scores} />
            
            {/* 分数详情 */}
            <View className="grid grid-cols-2 gap-3 mt-4">
              {DIMENSIONS.map(dim => {
                const score = report.scores[dim.key] || 0
                const levelInfo = getLevelDesc(score, dim.max)
                return (
                  <View key={dim.key} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex items-center justify-between">
                      <Text className="text-gray-600 text-sm">{dim.name}</Text>
                      <Text className={`font-bold ${levelInfo.color}`}>{score}/{dim.max}</Text>
                    </View>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {levelInfo.level}
                    </Badge>
                  </View>
                )
              })}
            </View>
          </CardContent>
        </Card>

        {/* 分项点评 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center">
              <FileText size={20} color="#2563eb" className="mr-2" />
              <Text className="font-semibold text-gray-900">分项点评</Text>
            </View>
          </CardHeader>
          <CardContent>
            <Accordion type="single">
              {['comprehensive', 'organizational', 'interpersonal', 'emergency'].map((key, idx) => {
                const dim = DIMENSIONS.find(d => d.key === key)!
                const score = report.scores[key] || 0
                const feedback = report.feedback?.[key] || { points: [] }
                
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger>
                      <View className="flex items-center justify-between w-full pr-4">
                        <View className="flex items-center">
                          <Badge className="mr-2">题{idx + 1}</Badge>
                          <Text>{dim.name}</Text>
                        </View>
                        <Text className="text-blue-600 font-bold">{score}分</Text>
                      </View>
                    </AccordionTrigger>
                    <AccordionContent>
                      <View className="space-y-2 pl-2">
                        {feedback.points?.map((point: string, i: number) => (
                          <View key={i} className="flex items-start">
                            <Text className="text-gray-400 mr-2">•</Text>
                            <Text className="text-gray-700 text-sm">{point}</Text>
                          </View>
                        ))}
                      </View>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* 优化建议 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center">
              <Lightbulb size={20} color="#f59e0b" className="mr-2" />
              <Text className="font-semibold text-gray-900">优化建议</Text>
            </View>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              {report.optimization?.map((item: string, i: number) => (
                <View key={i} className="flex items-start bg-yellow-50 rounded-lg p-3">
                  <TrendingUp size={16} color="#f59e0b" className="mr-2 flex-shrink-0" />
                  <Text className="text-gray-700 text-sm">{item}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* 高分答题框架 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center justify-between">
              <View className="flex items-center">
                <Award size={20} color="#22c55e" className="mr-2" />
                <Text className="font-semibold text-gray-900">高分答题参考</Text>
              </View>
              <Badge 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setShowReference(!showReference)}
              >
                {showReference ? '收起' : '展开'}
              </Badge>
            </View>
          </CardHeader>
          {showReference && (
            <CardContent>
              <View className="space-y-4">
                {report.references?.map((ref: any, i: number) => (
                  <View key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <Badge className="mb-2">{ref.type}</Badge>
                    <Text className="block text-gray-600 text-sm mb-2">答题框架：{ref.framework}</Text>
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="block text-gray-700 text-sm whitespace-pre-wrap">{ref.referenceAnswer}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          )}
        </Card>
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
        padding: '12px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 100
      }}
      >
        <View style={{ flex: 1 }}>
          <Button variant="outline" className="w-full" onClick={handleViewHistory}>
            查看历史
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" className="w-full" onClick={handleShare}>
            <Share2 size={18} color="#2563eb" />
            <Text className="ml-1">分享</Text>
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button className="w-full bg-blue-600" onClick={handleRestart}>
            <RotateCcw size={18} color="#fff" />
            <Text className="ml-1 text-white">再次模拟</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}