import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  GraduationCap,
  ChartBarBig,
  BookOpen,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  Lock
} from 'lucide-react-taro'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 导航菜单配置
const NAV_MENU = [
  { key: 'dashboard', label: '数据概览', icon: LayoutDashboard, path: '/pages/admin/dashboard/index' },
  { key: 'questions', label: '题库管理', icon: FileText, path: '/pages/admin/questions/index' },
  { key: 'users', label: '用户管理', icon: Users, path: '/pages/admin/users/index' },
  { key: 'orders', label: '订单管理', icon: ShoppingCart, path: '/pages/admin/orders/index' },
  { key: 'teachers', label: '老师管理', icon: GraduationCap, path: '/pages/admin/teachers/index' },
  { key: 'statistics', label: '数据统计', icon: ChartBarBig, path: '/pages/admin/statistics/index' },
  { key: 'access-codes', label: '访问码管理', icon: Settings, path: '/pages/admin/access-codes/index' },
  { key: 'guides', label: '备考指南', icon: BookOpen, path: '/pages/admin/guides/index' },
  { key: 'announcements', label: '公告管理', icon: Bell, path: '/pages/admin/announcements/index' },
  { key: 'settings', label: '系统设置', icon: Settings, path: '/pages/admin/settings/index' },
]

// 管理员密码（建议通过后端验证，这里作为演示）
const ADMIN_PASSWORD = 'admin123'

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 检查是否已验证
  useEffect(() => {
    const authenticated = Taro.getStorageSync('admin_authenticated')
    if (authenticated === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPasswordError('')
      Taro.setStorageSync('admin_authenticated', 'true')
    } else {
      setPasswordError('密码错误，请重新输入')
      setPassword('')
    }
  }

  const handleMenuClick = (key: string, path: string) => {
    setActiveMenu(key)
    Taro.navigateTo({ url: path })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出后台管理吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('admin_authenticated')
          Taro.redirectTo({ url: '/pages/index/index' })
        }
      }
    })
  }

  // 未验证时显示密码输入界面
  if (!isAuthenticated) {
    return (
      <View className="flex h-screen items-center justify-center bg-gray-100">
        <View className="bg-white rounded-xl shadow-lg p-8 w-80">
          <View className="flex items-center justify-center mb-6">
            <Lock size={48} color="#3b82f6" />
          </View>
          <Text className="block text-center text-xl font-bold text-gray-800 mb-2">
            后台管理登录
          </Text>
          <Text className="block text-center text-sm text-gray-500 mb-6">
            请输入管理员密码
          </Text>

          <Input
            password
            placeholder="请输入管理员密码"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
            className="w-full mb-4"
          />

          {passwordError && (
            <Text className="block text-center text-sm text-red-500 mb-4">
              {passwordError}
            </Text>
          )}

          <Button
            className="w-full py-3"
            onClick={handlePasswordSubmit}
          >
            <Text className="text-white">验证登录</Text>
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <View
        className="bg-slate-800 flex flex-col transition-all"
        style={{ width: sidebarCollapsed ? '64px' : '200px' }}
      >
        {/* Logo区域 */}
        <View className="p-4 border-b border-slate-700">
          <View className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <Text className="block text-lg font-bold text-white">后台管理</Text>
            )}
            <View
              className="p-2 rounded cursor-pointer hover:bg-slate-700"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <Menu size={20} color="#fff" />
              ) : (
                <ChevronLeft size={20} color="#fff" />
              )}
            </View>
          </View>
        </View>

        {/* 导航菜单 */}
        <View className="flex-1 py-4">
          {NAV_MENU.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.key
            return (
              <View
                key={item.key}
                className={`flex items-center px-4 py-3 mx-2 rounded cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
                onClick={() => handleMenuClick(item.key, item.path)}
              >
                <Icon size={20} color={isActive ? '#fff' : '#94a3b8'} />
                {!sidebarCollapsed && (
                  <Text className="block ml-3 text-sm">{item.label}</Text>
                )}
              </View>
            )
          })}
        </View>

        {/* 底部退出按钮 */}
        <View className="p-4 border-t border-slate-700">
          <View
            className="flex items-center px-4 py-2 rounded cursor-pointer text-gray-300 hover:bg-slate-700"
            onClick={handleLogout}
          >
            <LogOut size={20} color="#94a3b8" />
            {!sidebarCollapsed && (
              <Text className="block ml-3 text-sm">退出登录</Text>
            )}
          </View>
        </View>
      </View>

      {/* 主内容区 */}
      <View className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <View className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <View>
            <Text className="block text-lg font-medium text-gray-800">
              上岸吧公考面试 - 后台管理系统
            </Text>
            <Text className="block text-sm text-gray-500">
              当前页面：{NAV_MENU.find(m => m.key === activeMenu)?.label}
            </Text>
          </View>
          <View className="flex items-center">
            <View className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Text className="block text-sm text-white">管</Text>
            </View>
            <Text className="block ml-2 text-sm text-gray-600">管理员</Text>
          </View>
        </View>

        {/* 内容区域 */}
        <View className="flex-1 p-6">
          {/* 默认显示概览 */}
          <View className="bg-white rounded-lg shadow p-6">
            <Text className="block text-xl font-bold text-gray-800 mb-4">
              欢迎使用后台管理系统
            </Text>
            <Text className="block text-gray-600 mb-6">
              请从左侧菜单选择需要管理的模块
            </Text>

            {/* 快速统计卡片 */}
            <View className="grid grid-cols-4 gap-4">
              <View className="bg-blue-50 rounded-lg p-4">
                <Text className="block text-2xl font-bold text-blue-600">156</Text>
                <Text className="block text-sm text-gray-500">总用户数</Text>
              </View>
              <View className="bg-green-50 rounded-lg p-4">
                <Text className="block text-2xl font-bold text-green-600">48</Text>
                <Text className="block text-sm text-gray-500">付费会员</Text>
              </View>
              <View className="bg-orange-50 rounded-lg p-4">
                <Text className="block text-2xl font-bold text-orange-600">23</Text>
                <Text className="block text-sm text-gray-500">待处理订单</Text>
              </View>
              <View className="bg-purple-50 rounded-lg p-4">
                <Text className="block text-2xl font-bold text-purple-600">10</Text>
                <Text className="block text-sm text-gray-500">题库题目</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}