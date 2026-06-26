import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  FileText,
  Download
} from 'lucide-react-taro'

interface Question {
  id: number
  title: string
  type: 'comprehensive' | 'organizational' | 'interpersonal' | 'emergency'
  difficulty: 'easy' | 'medium' | 'hard'
  source: string
  createdAt: string
}

const TYPE_MAP = {
  comprehensive: '综合分析',
  organizational: '组织协调',
  interpersonal: '人际沟通',
  emergency: '应急应变'
}

const DIFFICULTY_MAP = {
  easy: '较易',
  medium: '中等',
  hard: '较难'
}

const DIFFICULTY_COLOR_MAP = {
  easy: 'text-green-600 bg-green-100',
  medium: 'text-orange-600 bg-orange-100',
  hard: 'text-red-600 bg-red-100'
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMethod, setImportMethod] = useState<'json' | 'knowledge'>('json')
  const [importJsonText, setImportJsonText] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [knowledgeQuery, setKnowledgeQuery] = useState('')
  const [knowledgeResults, setKnowledgeResults] = useState<any[]>([])
  const [selectedKnowledgeItems, setSelectedKnowledgeItems] = useState<number[]>([])

  // 新题目表单
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    type: 'comprehensive',
    difficulty: 'medium',
    source: '',
    reference: ''
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/questions',
        method: 'GET'
      })
      if (res.data?.data) {
        setQuestions(res.data.data)
      }
    } catch (error) {
      console.log('加载题目失败', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(q => {
    const matchKeyword = q.title.includes(searchKeyword)
    const matchType = filterType === 'all' || q.type === filterType
    return matchKeyword && matchType
  })

  const handleAddQuestion = async () => {
    if (!newQuestion.title) {
      Taro.showToast({ title: '请输入题目内容', icon: 'none' })
      return
    }
    try {
      await Network.request({
        url: '/api/questions',
        method: 'POST',
        data: newQuestion
      })
      Taro.showToast({ title: '添加成功', icon: 'success' })
      setShowAddModal(false)
      loadQuestions()
    } catch (error) {
      Taro.showToast({ title: '添加失败', icon: 'error' })
    }
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion) return
    try {
      await Network.request({
        url: `/api/questions/${editingQuestion.id}`,
        method: 'PUT',
        data: editingQuestion
      })
      Taro.showToast({ title: '更新成功', icon: 'success' })
      setEditingQuestion(null)
      loadQuestions()
    } catch (error) {
      Taro.showToast({ title: '更新失败', icon: 'error' })
    }
  }

  const handleDeleteQuestion = (id: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这道题目吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/questions/${id}`,
              method: 'DELETE'
            })
            Taro.showToast({ title: '删除成功', icon: 'success' })
            loadQuestions()
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      }
    })
  }

  const handleViewQuestion = (question: Question) => {
    Taro.showModal({
      title: TYPE_MAP[question.type],
      content: question.title,
      showCancel: false
    })
  }

  const handleBatchImport = () => {
    setShowImportModal(true)
    setImportJsonText('')
    setImportMethod('json')
  }

  // 解析JSON并导入题目
  const handleJsonImport = async () => {
    if (!importJsonText.trim()) {
      Taro.showToast({ title: '请输入JSON数据', icon: 'none' })
      return
    }

    try {
      const questionsData = JSON.parse(importJsonText)
      if (!Array.isArray(questionsData)) {
        Taro.showToast({ title: 'JSON格式错误，需要数组格式', icon: 'none' })
        return
      }

      setImportLoading(true)
      let successCount = 0

      for (const q of questionsData) {
        try {
          await Network.request({
            url: '/api/questions',
            method: 'POST',
            data: {
              title: q.title || q.content || q.question,
              type: q.type || 'comprehensive',
              difficulty: q.difficulty || 'medium',
              source: q.source || q.from || '批量导入',
              reference: q.reference || q.answer || q.analysis || ''
            }
          })
          successCount++
        } catch (e) {
          console.log('导入单题失败', e)
        }
      }

      Taro.showToast({ title: `成功导入 ${successCount} 题`, icon: 'success' })
      loadQuestions()
      setShowImportModal(false)
    } catch (error) {
      Taro.showToast({ title: 'JSON解析失败，请检查格式', icon: 'none' })
    } finally {
      setImportLoading(false)
    }
  }

  // 从知识库搜索题目
  const handleKnowledgeSearch = async () => {
    if (!knowledgeQuery.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }

    setImportLoading(true)
    try {
      const res = await Network.request({
        url: '/api/knowledge/search',
        method: 'POST',
        data: { query: knowledgeQuery, topK: 10 }
      })

      if (res.data?.data?.chunks) {
        setKnowledgeResults(res.data.data.chunks)
      } else {
        Taro.showToast({ title: '未找到相关内容', icon: 'none' })
      }
    } catch (error) {
      Taro.showToast({ title: '知识库搜索失败', icon: 'none' })
    } finally {
      setImportLoading(false)
    }
  }

  // 导入选中的知识库内容
  const handleKnowledgeImport = async () => {
    if (selectedKnowledgeItems.length === 0) {
      Taro.showToast({ title: '请先选择要导入的内容', icon: 'none' })
      return
    }

    setImportLoading(true)
    let successCount = 0

    for (const idx of selectedKnowledgeItems) {
      const item = knowledgeResults[idx]
      try {
        await Network.request({
          url: '/api/questions',
          method: 'POST',
          data: {
            title: item.content,
            type: 'comprehensive',
            difficulty: 'medium',
            source: '知识库导入',
            reference: ''
          }
        })
        successCount++
      } catch (e) {
        console.log('导入失败', e)
      }
    }

    Taro.showToast({ title: `成功导入 ${successCount} 题`, icon: 'success' })
    loadQuestions()
    setShowImportModal(false)
    setImportLoading(false)
    setSelectedKnowledgeItems([])
    setKnowledgeResults([])
  }

  return (
    <View className="p-6">
      {/* 操作栏 */}
      <View className="bg-white rounded-lg shadow p-4 mb-4">
        {/* 第一行：搜索和筛选 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {/* 搜索框 */}
          <View style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              style={{ border: 'none', outline: 'none', marginLeft: '8px', fontSize: '14px', width: '160px', backgroundColor: 'transparent' }}
              placeholder="搜索题目..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </View>

          {/* 类型筛选 */}
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'comprehensive', 'organizational', 'interpersonal', 'emergency'].map((type) => (
              <View
                key={type}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: filterType === type ? '#3b82f6' : '#f3f4f6',
                  color: filterType === type ? '#fff' : '#666'
                }}
                onClick={() => setFilterType(type)}
              >
                <Text style={{ fontSize: '13px' }}>{type === 'all' ? '全部' : TYPE_MAP[type as keyof typeof TYPE_MAP]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 第二行：操作按钮 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View
            style={{ backgroundColor: '#22c55e', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={handleBatchImport}
          >
            <Download size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '500' }}>批量导入</Text>
          </View>
          <View
            style={{ backgroundColor: '#3b82f6', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '500' }}>添加题目</Text>
          </View>
        </View>
      </View>

      {/* 题目列表 */}
      <View className="bg-white rounded-lg shadow">
        <View className="p-4 border-b border-gray-200">
          <View className="flex items-center justify-between">
            <Text className="block text-lg font-bold text-gray-800">题库列表</Text>
            <Text className="block text-sm text-gray-500">共 {filteredQuestions.length} 道题目</Text>
          </View>
        </View>

        {loading ? (
          <View className="p-8 text-center">
            <Text className="block text-gray-500">加载中...</Text>
          </View>
        ) : filteredQuestions.length === 0 ? (
          <View className="p-8 text-center">
            <FileText size={48} color="#d1d5db" />
            <Text className="block text-gray-500 mt-2">暂无题目数据</Text>
          </View>
        ) : (
          <View className="divide-y divide-gray-100">
            {filteredQuestions.map((question) => (
              <View key={question.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <View className="flex-1">
                  <View className="flex items-center gap-2 mb-1">
                    <View className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">
                      <Text className="block">{TYPE_MAP[question.type]}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded text-xs ${DIFFICULTY_COLOR_MAP[question.difficulty]}`}>
                      <Text className="block">{DIFFICULTY_MAP[question.difficulty]}</Text>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-800 line-clamp-2">{question.title}</Text>
                  <Text className="block text-xs text-gray-400 mt-1">来源：{question.source || '自研题库'}</Text>
                </View>

                <View className="flex items-center gap-2">
                  <View
                    className="p-2 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewQuestion(question)}
                  >
                    <Eye size={16} color="#6b7280" />
                  </View>
                  <View
                    className="p-2 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => setEditingQuestion(question)}
                  >
                    <Pencil size={16} color="#3b82f6" />
                  </View>
                  <View
                    className="p-2 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 添加题目弹窗 */}
      {showAddModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-lg shadow-lg p-6" style={{ width: '500px', maxWidth: '90vw' }}>
            <Text className="block text-lg font-bold mb-4">添加新题目</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="block text-sm text-gray-600 mb-1">题型</Text>
                <View className="flex gap-2">
                  {['comprehensive', 'organizational', 'interpersonal', 'emergency'].map((type) => (
                    <View
                      key={type}
                      className={`px-3 py-1 rounded text-sm cursor-pointer ${
                        newQuestion.type === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setNewQuestion({ ...newQuestion, type })}
                    >
                      <Text className="block">{TYPE_MAP[type]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">难度</Text>
                <View className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <View
                      key={diff}
                      className={`px-3 py-1 rounded text-sm cursor-pointer ${
                        newQuestion.difficulty === diff
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setNewQuestion({ ...newQuestion, difficulty: diff })}
                    >
                      <Text className="block">{DIFFICULTY_MAP[diff]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">题目内容</Text>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  rows={4}
                  placeholder="请输入题目内容..."
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                />
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">题目来源</Text>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  placeholder="如：2024年省考真题"
                  value={newQuestion.source}
                  onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
                />
              </View>
            </View>

            <View className="flex justify-end gap-2 mt-6">
              <View
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                <Text className="block text-sm">取消</Text>
              </View>
              <View
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                onClick={handleAddQuestion}
              >
                <Text className="block text-sm">添加</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 编辑题目弹窗 */}
      {editingQuestion && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-lg shadow-lg p-6" style={{ width: '500px', maxWidth: '90vw' }}>
            <Text className="block text-lg font-bold mb-4">编辑题目</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="block text-sm text-gray-600 mb-1">题型</Text>
                <View className="flex gap-2">
                  {['comprehensive', 'organizational', 'interpersonal', 'emergency'].map((type) => (
                    <View
                      key={type}
                      className={`px-3 py-1 rounded text-sm cursor-pointer ${
                        editingQuestion.type === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setEditingQuestion({ ...editingQuestion, type: type as 'comprehensive' | 'organizational' | 'interpersonal' | 'emergency' })}
                    >
                      <Text className="block">{TYPE_MAP[type]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">难度</Text>
                <View className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <View
                      key={diff}
                      className={`px-3 py-1 rounded text-sm cursor-pointer ${
                        editingQuestion.difficulty === diff
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setEditingQuestion({ ...editingQuestion, difficulty: diff as 'easy' | 'medium' | 'hard' })}
                    >
                      <Text className="block">{DIFFICULTY_MAP[diff]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">题目内容</Text>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  rows={4}
                  value={editingQuestion.title}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                />
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-1">题目来源</Text>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  value={editingQuestion.source}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, source: e.target.value })}
                />
              </View>
            </View>

            <View className="flex justify-end gap-2 mt-6">
              <View
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                onClick={() => setEditingQuestion(null)}
              >
                <Text className="block text-sm">取消</Text>
              </View>
              <View
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                onClick={handleEditQuestion}
              >
                <Text className="block text-sm">保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 批量导入弹窗 */}
      {showImportModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-lg shadow-lg p-6" style={{ width: '600px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <Text className="block text-lg font-bold mb-4">批量导入题目</Text>
            
            {/* 导入方式选择 */}
            <View className="flex gap-4 mb-4">
              <View
                className={`flex-1 p-3 rounded border cursor-pointer ${
                  importMethod === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setImportMethod('json')}
              >
                <Text className="block text-center font-medium">JSON格式导入</Text>
                <Text className="block text-center text-xs text-gray-500 mt-1">粘贴题目JSON数据</Text>
              </View>
              <View
                className={`flex-1 p-3 rounded border cursor-pointer ${
                  importMethod === 'knowledge' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setImportMethod('knowledge')}
              >
                <Text className="block text-center font-medium">知识库导入</Text>
                <Text className="block text-center text-xs text-gray-500 mt-1">从扣子知识库搜索导入</Text>
              </View>
            </View>

            {/* JSON导入 */}
            {importMethod === 'json' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-sm text-gray-600 mb-2">JSON格式示例：</Text>
                  <View className="bg-gray-100 rounded p-3 text-xs">
                    <Text className="block text-gray-600">{`[{"title":"题目内容","type":"comprehensive"},{"title":"题目2","type":"organizational"}]`}</Text>
                  </View>
                  <Text className="block text-xs text-gray-500 mt-2">
                    type可选: comprehensive(综合分析) / organizational(组织协调) / interpersonal(人际沟通) / emergency(应急应变)
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    difficulty可选: easy(较易) / medium(中等) / hard(较难)
                  </Text>
                </View>

                <View>
                  <Text className="block text-sm text-gray-600 mb-1">粘贴JSON数据：</Text>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    rows={8}
                    placeholder='[{"title": "...", "type": "...", "difficulty": "..."}]'
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                  />
                </View>

                <View className="flex justify-end gap-2">
                  <View
                    className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                    onClick={() => setShowImportModal(false)}
                  >
                    <Text className="block text-sm">取消</Text>
                  </View>
                  <View
                    className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer ${importLoading ? 'opacity-50' : ''}`}
                    onClick={importLoading ? undefined : handleJsonImport}
                  >
                    <Text className="block text-sm">{importLoading ? '导入中...' : '开始导入'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 知识库导入 */}
            {importMethod === 'knowledge' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-sm text-gray-600 mb-1">搜索知识库内容：</Text>
                  <View className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded p-2 text-sm"
                      placeholder="输入关键词搜索..."
                      value={knowledgeQuery}
                      onChange={(e) => setKnowledgeQuery(e.target.value)}
                    />
                    <View
                      className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer ${importLoading ? 'opacity-50' : ''}`}
                      onClick={importLoading ? undefined : handleKnowledgeSearch}
                    >
                      <Text className="block text-sm">搜索</Text>
                    </View>
                  </View>
                </View>

                {/* 搜索结果 */}
                {knowledgeResults.length > 0 && (
                  <View>
                    <Text className="block text-sm text-gray-600 mb-2">搜索结果（点击选择）：</Text>
                    <View className="space-y-2 max-h-48 overflow-y-auto">
                      {knowledgeResults.map((item, idx) => (
                        <View
                          key={idx}
                          className={`p-3 rounded border cursor-pointer ${
                            selectedKnowledgeItems.includes(idx) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => {
                            if (selectedKnowledgeItems.includes(idx)) {
                              setSelectedKnowledgeItems(selectedKnowledgeItems.filter(i => i !== idx))
                            } else {
                              setSelectedKnowledgeItems([...selectedKnowledgeItems, idx])
                            }
                          }}
                        >
                          <Text className="block text-sm line-clamp-3">{item.content}</Text>
                          <Text className="block text-xs text-gray-400 mt-1">相似度: {item.score?.toFixed(2) || '-'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View className="flex justify-between items-center">
                  <Text className="block text-xs text-gray-500">
                    已选择 {selectedKnowledgeItems.length} 条内容
                  </Text>
                  <View className="flex justify-end gap-2">
                    <View
                      className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                      onClick={() => setShowImportModal(false)}
                    >
                      <Text className="block text-sm">取消</Text>
                    </View>
                    <View
                      className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer ${importLoading || selectedKnowledgeItems.length === 0 ? 'opacity-50' : ''}`}
                      onClick={importLoading || selectedKnowledgeItems.length === 0 ? undefined : handleKnowledgeImport}
                    >
                      <Text className="block text-sm">{importLoading ? '导入中...' : '导入选中内容'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}