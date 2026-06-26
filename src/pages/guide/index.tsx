import { useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Download,
  Lock,
  ChevronRight,
  Clock,
  Target,
  Lightbulb,
  CircleAlert,
  FileText,
  BookOpen,
  Crown,
} from 'lucide-react-taro'

// 备考指南内容数据
const GUIDE_DATA = {
  // 一、面试流程
  process: {
    title: '面试流程',
    icon: Clock,
    content: `一、结构化面试流程详解

结构化面试是公务员录用考试的主要面试形式，流程规范、标准统一。以下是完整的面试流程：

1. 报到与抽签
考生需在规定时间前到达考点，携带身份证、准考证等证件。进入候考室后，工作人员会组织考生进行抽签，确定面试顺序。抽签结果密封保存，考生按顺序依次进入考场。

2. 候考阶段
抽签完成后，考生在候考室等待。期间不得离开候考室，不得与其他考生交流，不得使用通讯工具。建议利用这段时间调整心态，回顾备考要点。

3. 进入考场
引导员按顺序引导考生进入考场。进入时需敲门（一般敲三下），得到允许后进入。向考官问好，得到示意后入座。

4. 题本阅读
考生入座后，主考官会介绍面试规则，发放题本。考生有3-5分钟阅读题目并思考。期间可以在草稿纸上记录要点。

5. 答题环节
考生按题目顺序逐一作答，每题答题时间一般不超过3分钟。答题时需注意：
- 观点明确，开门见山
- 层次清晰，逻辑严密
- 语言流畅，表达准确
- 态度诚恳，举止得体

6. 退场与公布成绩
答题结束后，考生向考官致谢后退场。到指定区域等待成绩公布。成绩一般采用去掉最高分和最低分后取平均分的方式计算。

注意事项：
- 全程保持礼貌，展现良好素质
- 着装得体，建议正装出席
- 时间把控精准，避免超时
- 保持自信，从容应对`,
  },

  // 二、评分标准
  criteria: {
    title: '评分标准',
    icon: Target,
    content: `二、面试评分标准详解

公务员结构化面试采用六维度评分法，总分100分，细分为以下六个维度：

【综合分析能力】（20分）
评分标准：
- 好（16-20分）：能围绕题干信息，从多方面辩证、客观地进行分析，能够透过现象看本质。整体遵循"表态—解读现象—分析原因—提出对策—总结升华"答题框架，思路清晰，说理透彻。
- 中（11-15分）：对题干信息的分析基本到位，观点基本合理，有基本的层次，但看问题的角度不够全面，联系实际论述一般。
- 差（0-10分）：认识片面，缺乏思路，条理性差，内容简单。

答题要点：
1. 观点明确，立场正确
2. 分析全面，多角度思考
3. 逻辑清晰，层次分明
4. 深入本质，不停留表面
5. 提出对策，切实可行

【组织协调能力】（20分）
评分标准：
- 好（16-20分）：能充分了解工作目标和组织意图，采取有效措施执行任务，充分考虑执行过程中可能遇到的问题，并提出解决方案，顺利完成任务。
- 中（11-15分）：能够了解工作目标和组织意图，能选取比较有效的措施执行任务，但考虑问题不够周全。
- 差（0-10分）：未能了解工作目标和组织意图，选取的措施可行性较差，思路混乱。

答题要点：
1. 明确任务目标
2. 制定详细计划
3. 合理分配资源
4. 预判潜在问题
5. 确保任务完成

【人际沟通能力】（20分）
评分标准：
- 好（16-20分）：能针对具体情况，沉着冷静、积极主动地与相关人员沟通，虚心听取意见，有效管控分歧，矛盾化解效果好。
- 中（11-15分）：能与相关人员进行一定沟通，但沟通方式不够灵活、恰当。
- 差（0-10分）：沟通方法死板，考虑不周全，沟通效果差。

答题要点：
1. 换位思考，理解对方
2. 诚恳沟通，态度积极
3. 尊重他人，虚心听取
4. 寻求共识，化解矛盾
5. 维护关系，促进合作

【应急应变能力】（20分）
评分标准：
- 好（16-20分）：能针对实际情况，以"稳秩序、解情绪、办好事、堵漏洞"的逻辑进行处置，态度诚恳、语言规范、步骤清晰、说服力强，效果明显。
- 中（11-15分）：针对实际情况，基本能控制局面，但考虑不够周到。
- 差（0-10分）：缺少有效的处置方式，无法有效解决问题。

答题要点：
1. 保持冷静，快速反应
2. 稳定秩序，控制局面
3. 安抚情绪，化解矛盾
4. 解决问题，妥善处理
5. 总结经验，堵塞漏洞

【语言表达能力】（10分）
AI评分默认值：8分
考察要点：
- 语言流畅度：表达连贯，无明显停顿
- 条理清晰度：层次分明，逻辑严密
- 准确精准度：用词准确，表述恰当
- 语气语态：声音洪亮，语速适中

【举止仪表】（10分）
AI评分默认值：8分
考察要点：
- 穿着打扮：正装出席，衣着整洁
- 体态举止：站姿端正，坐姿得体
- 答题礼仪：礼貌问好，致谢退场
- 时间把控：答题时间控制合理`,
  },

  // 三、答题技巧
  techniques: {
    title: '答题技巧',
    icon: Lightbulb,
    content: `三、高分答题技巧总结

掌握以下答题技巧，助你面试脱颖而出：

一、综合分析题答题技巧

【答题框架】
表态 → 分析原因 → 提出对策 → 总结升华

【高分要点】
1. 开篇表态要明确：支持/反对/辩证看待
2. 原因分析要多维：个人层面、社会层面、制度层面
3. 对策提出要具体：有针对性、可操作性
4. 结尾升华要有高度：联系国家政策、社会发展趋势

【常用句式】
- "我认为这一现象反映了..."
- "产生这种现象的原因是多方面的..."
- "针对这一问题，我建议从以下几个方面着手..."
- "作为一名公务员，我将..."

二、组织协调题答题技巧

【答题框架】
明确目标 → 制定计划 → 组织实施 → 总结反馈

【高分要点】
1. 开篇明确任务意义和目标
2. 计划要详细具体：时间节点、人员分工、资源调配
3. 执行过程要有保障措施：应急预案、监督检查
4. 结尾要有总结反思和长效机制

【常用句式】
- "组织这次活动，我的目标是..."
- "我将按照以下步骤组织实施..."
- "为确保活动顺利开展，我会..."
- "活动结束后，我会及时总结..."

三、人际沟通题答题技巧

【答题框架】
分析情况 → 表明态度 → 具体做法 → 总结效果

【高分要点】
1. 先分析问题原因，不要急于表态
2. 沟通态度要诚恳积极
3. 沟通方式要因人而异
4. 最终目标要达成共识、解决问题

【常用句式】**
- "面对这种情况，我会首先冷静分析..."
- "我认为同事/领导的想法有其道理..."
- "我会采取以下方式沟通..."
- "通过沟通，我相信能够..."

四、应急应变题答题技巧

【答题框架】
控制现场 → 分析情况 → 采取措施 → 总结预防

【高分要点】
1. 首要任务是稳定局面、控制事态
2. 分析情况要快速准确
3. 处理措施要分轻重缓急
4. 结尾要总结教训、建立预防机制

【常用句式】**
- "面对突发情况，我会首先稳定现场秩序..."
- "我会迅速判断问题的性质和严重程度..."
- "我将采取以下措施妥善处理..."
- "事后我会总结经验，完善应急预案..."`,
  },

  // 四、考场注意事项
  precautions: {
    title: '考场注意事项',
    icon: CircleAlert,
    content: `四、考场注意事项全攻略

进入考场，细节决定成败。以下注意事项务必牢记：

一、着装礼仪

【着装要求】
- 男士：深色西装套装、浅色衬衫、深色皮鞋
- 女士：职业套装或正装裙装、淡妆、发型整洁
- 避免：过于鲜艳的颜色、夸张的配饰、过于休闲的服装

【仪态要求】
- 站姿：挺胸收腹，双手自然下垂或置于身前
- 坐姿：上身挺直，双手自然放在桌面或膝上
- 眼神：与考官保持适当眼神交流，不要东张西望
- 表情：自然大方，保持微笑

二、入场礼仪

【入场流程】
1. 敲门：轻敲三下，等待考官回应
2. 进入：稳步走入，面向考官站立
3. 问好：鞠躬或点头示意，说"各位考官好，我是XX号考生"
4. 入座：得到示意后入座，调整坐姿

【注意事项】**
- 不要推门直接进入，必须敲门
- 不要在门口徘徊犹豫
- 问好声音要洪亮清晰
- 入座后不要频繁调整位置

三、答题礼仪

【答题要求】**
- 开始答题前示意："现在开始回答第一题"
- 答题结束示意："第一题回答完毕"
- 语速适中，声音洪亮
- 保持与考官的眼神交流

【注意事项】**
- 不要低头答题，全程念稿
- 不要频繁看向某一考官
- 不要超时，注意把控时间
- 不要打断考官说话

四、退场礼仪

【退场流程】**
1. 答题完毕后，示意："所有题目回答完毕"
2. 向考官致谢："谢谢各位考官"
3. 起身鞠躬或点头示意
4. 稳步退出考场，不要奔跑

【注意事项】**
- 不要忘记致谢
- 退场时不要回头看题本
- 出门后不要大声喧哗
- 在候分区安静等待

五、禁忌事项

【绝对禁止】**
- 不得携带手机等通讯工具
- 不得携带手表（考场有计时器）
- 不得与他人交流讨论
- 不得泄露个人信息（姓名、工作单位等）
- 不得使用不文明语言
- 不得对考官或题目发表负面评价`,
  },

  // 五、素材库
  materials: {
    title: '素材库',
    icon: FileText,
    content: `五、面试答题素材库

丰富的素材储备，让你的答题更有深度和说服力：

一、名言警句素材

【为民服务类】**
- "人民对美好生活的向往，就是我们的奋斗目标" ——习近平
- "江山就是人民，人民就是江山" ——习近平
- "群众利益无小事，民生问题大于天"

【改革创新类】**
- "改革永远在路上，改革之路无坦途"
- "惟改革者进，惟创新者强，惟改革创新者胜" ——习近平
- "创新是引领发展的第一动力"

【担当作为类】**
- "空谈误国，实干兴邦"
- "青年一代有理想、有本领、有担当，国家就有前途"
- "有多大担当才能干多大事业"

【廉洁自律类】**
- "清正廉洁作表率，重点是教育引导广大党员干部保持为民务实清廉的政治本色"
- "廉洁自律是党员干部的基本要求"

二、政策热点素材

【民生保障】**
- 医保改革：城乡居民医保整合，提高保障水平
- 教育公平：义务教育均衡发展，减轻学生负担
- 养老服务：社区养老、居家养老模式创新

【社会治理】**
- 基层治理：网格化管理、社区服务提升
- 数字政务：政务服务数字化转型
- 乡村振兴：产业振兴、人才振兴、文化振兴

【经济发展】**
- 新发展理念：创新、协调、绿色、开放、共享
- 高质量发展：供给侧结构性改革
- 双循环：国内国际双循环发展格局

三、典型案例素材

【正面案例】**
- 某市创新政务服务模式，实现"一网通办"
- 某县推进乡村振兴，带动农民增收致富
- 某社区开展志愿服务，营造和谐邻里关系

【反面案例】**
- 某部门服务态度差，引发群众不满（反思改进）
- 某项目执行不力，造成资源浪费（吸取教训）

四、数据支撑素材

【常用数据】**
- 我国城镇化率超过60%
- 基本医疗保险参保人数超过13亿
- 全国市场主体数量超过1.5亿户

会员专享：完整素材库PDF下载，包含200+精选素材`,
    downloads: [
      { name: '完整素材库PDF', size: '2.5MB', type: 'pdf' },
      { name: '名言警句速查表', size: '0.8MB', type: 'pdf' },
      { name: '政策热点汇编', size: '1.2MB', type: 'pdf' },
    ],
  },

  // 六、案例库
  cases: {
    title: '案例库',
    icon: BookOpen,
    content: `六、高分答题案例库

精选真实高分答题案例，助你学习借鉴：

【案例一：综合分析题】

题目：当前社会上存在"躺平"现象，有人认为这是一种消极逃避，也有人认为这是年轻人的自我保护。请谈谈你的看法。

高分答题示例：

我认为"躺平"现象是一个复杂的社会问题，需要辩证看待。

首先，我们要看到"躺平"现象产生的深层原因。从个人层面看，部分年轻人面对激烈的竞争压力，选择"躺平"是一种自我保护机制。从社会层面看，当前就业压力较大、房价高企、工作强度高等现实问题，让部分年轻人感到无力改变现状。从制度层面看，社会保障体系还不够完善，对年轻人的支持力度有待加强。

其次，我们要认识到"躺平"现象的双重影响。消极方面，长期躺平可能导致个人发展停滞，影响社会活力和创新动力。积极方面，躺平现象也反映了年轻人对生活质量的追求，对过度竞争的反思。

最后，我认为解决这一问题需要多方共同努力。政府层面，要完善社会保障体系，减轻年轻人的生存压力，创造更多就业机会。企业层面，要建立更加人性化的工作环境，合理安排工作时间和强度。社会层面，要树立多元成功观，尊重不同的生活选择。个人层面，年轻人要保持积极向上的心态，在追求生活品质的同时也要承担社会责任。

作为一名公务员，我将关注这一现象背后的社会问题，积极推动相关政策完善，为年轻人创造更好的发展环境。

---

会员专享：完整案例库包含50+高分答题案例，涵盖所有题型`,
    caseList: [
      {
        id: 1,
        type: '综合分析',
        title: '躺平现象怎么看',
        preview: '我认为"躺平"现象是一个复杂的社会问题，需要辩证看待...',
      },
      {
        id: 2,
        type: '组织协调',
        title: '组织学习交流活动',
        preview: '组织这次活动，我的目标是促进单位内部的知识分享和团队凝聚力...',
      },
      {
        id: 3,
        type: '人际沟通',
        title: '处理同事分歧',
        preview: '面对同事的质疑，我会首先冷静分析分歧产生的原因...',
      },
      {
        id: 4,
        type: '应急应变',
        title: '窗口服务突发状况',
        preview: '作为窗口服务人员，我会首先稳定群众情绪，耐心倾听...',
      },
    ],
  },
}

// 模拟会员状态（实际应用中需要从后端获取）
const useMemberStatus = () => {
  const [isMember, setIsMember] = useState(false)
  return { isMember, setIsMember }
}

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('process')
  const [searchQuery, setSearchQuery] = useState('')
  const { isMember } = useMemberStatus()
  const [expandedCase, setExpandedCase] = useState<number | null>(null)

  // 搜索过滤
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return null
    const query = searchQuery.toLowerCase()
    const results: { section: string; matches: string[] }[] = []

    Object.entries(GUIDE_DATA).forEach(([, section]) => {
      const lines = section.content.split('\n')
      const matches = lines.filter(line => line.toLowerCase().includes(query))
      if (matches.length > 0) {
        results.push({ section: section.title, matches })
      }
    })

    return results
  }, [searchQuery])

  // 内容预览处理（非会员只看前200字）
  const getPreviewContent = (content: string, full: boolean = isMember) => {
    if (full) return content
    const preview = content.slice(0, 200)
    return preview + '...'
  }

  // 跳转会员页面
  const goToMember = () => {
    Taro.navigateTo({ url: '/pages/member/index' })
  }

  // 下载素材（会员专享）
  const handleDownload = (name: string) => {
    if (!isMember) {
      goToMember()
      return
    }
    Taro.showToast({ title: `正在下载 ${name}`, icon: 'loading' })
    // 实际下载逻辑需要后端支持
  }

  // 展开案例详情
  const toggleCase = (id: number) => {
    if (!isMember && id !== 1) {
      goToMember()
      return
    }
    setExpandedCase(expandedCase === id ? null : id)
  }

  return (
    <View className="flex flex-col min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <View className="bg-white px-4 py-3 sticky top-0 z-10">
        <View className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} color="#999" />
          <Input
            className="flex-1 bg-transparent text-sm ml-2"
            placeholder="搜索关键词（如：评分标准、答题技巧）"
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
          {searchQuery && (
            <Text
              className="text-gray-400 text-xs"
              onClick={() => setSearchQuery('')}
            >
              清除
            </Text>
          )}
        </View>
      </View>

      {/* 搜索结果 */}
      {filteredContent && filteredContent.length > 0 && (
        <View className="bg-white mx-4 mt-3 rounded-lg p-4">
          <Text className="block text-sm font-medium text-gray-700 mb-3">
            搜索结果 ({filteredContent.reduce((sum, r) => sum + r.matches.length, 0)} 条)
          </Text>
          {filteredContent.map((result, idx) => (
            <View key={idx} className="mb-3 last:mb-0">
              <Badge variant="outline" className="mb-2">{result.section}</Badge>
              {result.matches.slice(0, 3).map((match, i) => (
                <Text key={i} className="block text-xs text-gray-600 mb-1">
                  {match.slice(0, 100)}...
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* 会员提示 */}
      {!isMember && (
        <View
          className="bg-gradient-to-r from-blue-500 to-blue-600 mx-4 mt-3 rounded-lg p-4 flex items-center justify-between"
          onClick={goToMember}
        >
          <View className="flex items-center">
            <Crown size={24} color="#fff" className="mr-2" />
            <View>
              <Text className="block text-white font-medium">开通会员</Text>
              <Text className="block text-white text-xs opacity-80">
                解锁完整内容 + 素材下载
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#fff" />
        </View>
      )}

      {/* 内容区域 */}
      <View className="flex-1 px-4 pb-8 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 mb-4">
            {Object.entries(GUIDE_DATA).map(([key, section]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                <View className="flex items-center">
                  <section.icon size={14} className="mr-1" color="#2563eb" />
                  <Text>{section.title}</Text>
                </View>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(GUIDE_DATA).map(([key, section]) => (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <section.icon size={20} className="mr-2" color="#2563eb" />
                    <Text>{section.title}</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 内容展示 */}
                  <View className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    <Text className="block">{getPreviewContent(section.content)}</Text>
                  </View>

                  {/* 非会员解锁提示 */}
                  {!isMember && section.content.length > 200 && (
                    <View
                      className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center cursor-pointer"
                      onClick={goToMember}
                    >
                      <Lock size={16} className="mr-2" color="#2563eb" />
                      <Text className="text-blue-600 text-sm">
                        开通会员查看完整内容
                      </Text>
                    </View>
                  )}

                  {/* 素材下载（仅素材库显示） */}
                  {key === 'materials' && 'downloads' in section && section.downloads && (
                    <View className="mt-4">
                      <Separator className="mb-4" />
                      <Text className="block text-sm font-medium text-gray-700 mb-3">
                        可下载素材
                      </Text>
                      {section.downloads.map((file, idx) => (
                        <View
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2 last:mb-0"
                          onClick={() => handleDownload(file.name)}
                        >
                          <View className="flex items-center">
                            <FileText size={16} className="mr-2" color="#2563eb" />
                            <View>
                              <Text className="block text-sm text-gray-700">{file.name}</Text>
                              <Text className="block text-xs text-gray-500">{file.size}</Text>
                            </View>
                          </View>
                          {isMember ? (
                            <Download size={18} color="#2563eb" />
                          ) : (
                            <Lock size={18} color="#999" />
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 案例列表（仅案例库显示） */}
                  {key === 'cases' && 'caseList' in section && section.caseList && (
                    <View className="mt-4">
                      <Separator className="mb-4" />
                      <Text className="block text-sm font-medium text-gray-700 mb-3">
                        高分案例
                      </Text>
                      {section.caseList.map((caseItem) => (
                        <View
                          key={caseItem.id}
                          className="bg-gray-50 rounded-lg mb-3 last:mb-0 overflow-hidden"
                        >
                          <View
                            className="flex items-center justify-between px-4 py-3"
                            onClick={() => toggleCase(caseItem.id)}
                          >
                            <View className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {caseItem.type}
                              </Badge>
                              <Text className="text-sm text-gray-700">{caseItem.title}</Text>
                            </View>
                            {(!isMember && caseItem.id !== 1) ? (
                              <Lock size={16} color="#999" />
                            ) : (
                              <ChevronRight
                                size={16}
                                color="#999"
                                className={expandedCase === caseItem.id ? 'rotate-90' : ''}
                              />
                            )}
                          </View>
                          {expandedCase === caseItem.id && (
                            <View className="px-4 py-3 bg-white border-t border-gray-100">
                              <Text className="block text-xs text-gray-600 leading-relaxed">
                                {caseItem.id === 1 ? section.content.split('\n\n\n')[0] : (isMember ? '会员可查看完整案例内容...' : '')}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </View>
    </View>
  )
}