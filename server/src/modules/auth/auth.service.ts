import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

const supabase = getSupabaseClient()

@Injectable()
export class AuthService {
  /**
   * 微信登录（模拟）
   * 实际需要调用微信API获取openid
   */
  async wechatLogin(code: string) {
    // 模拟微信登录流程
    // 实际需要调用：https://api.weixin.qq.com/sns/jscode2session
    
    const mockOpenId = `mock_openid_${Date.now()}`
    const mockSessionKey = `mock_session_${Math.random().toString(36).substring(2, 15)}`
    
    // 查找或创建用户
    const existingUser = await supabase.from('users')
      .select('*')
      .eq('openid', mockOpenId)
      .single()

    let user
    let isNewUser = false

    if (existingUser.data) {
      user = existingUser.data
    } else {
      isNewUser = true
      const newUser = await supabase.from('users')
        .insert({
          openid: mockOpenId,
          session_key: mockSessionKey,
          nickname: '微信用户',
          avatar_url: '',
          member_type: 'free',
          daily_answer_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (newUser.error) {
        throw new Error(`创建用户失败: ${newUser.error.message}`)
      }
      user = newUser.data
    }

    return {
      user,
      isNewUser,
      token: `mock_token_${user.id}_${Date.now()}` // 实际应使用JWT
    }
  }

  /**
   * 更新用户同意协议状态
   */
  async updateAgreement(userId: string, agreements: {
    userAgreement: boolean
    privacyPolicy: boolean
    notificationPush: boolean
  }) {
    const result = await supabase.from('users')
      .update({
        agreed_user_policy: agreements.userAgreement,
        agreed_privacy_policy: agreements.privacyPolicy,
        agreed_notification: agreements.notificationPush,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (result.error) {
      throw new Error(`更新协议状态失败: ${result.error.message}`)
    }

    return result.data
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string) {
    const result = await supabase.from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (result.error) {
      throw new Error(`获取用户信息失败: ${result.error.message}`)
    }

    return result.data
  }

  /**
   * 检查会员状态
   */
  async checkMemberStatus(userId: string) {
    const user = await this.getUserInfo(userId)
    
    const now = new Date()
    const expireAt = user.member_expire_at ? new Date(user.member_expire_at) : null
    
    const isMember = expireAt && expireAt > now
    const daysLeft = isMember ? Math.ceil((expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

    return {
      isMember,
      memberType: user.member_type,
      expireAt: user.member_expire_at,
      daysLeft,
      freeReviewCount: user.free_review_count || 0
    }
  }

  /**
   * 检查每日答题次数
   */
  async checkDailyAnswerCount(userId: string) {
    const user = await this.getUserInfo(userId)
    
    // 会员无限次，免费用户每日3次
    const isMember = user.member_type !== 'free' && 
      user.member_expire_at && 
      new Date(user.member_expire_at) > new Date()

    if (isMember) {
      return {
        canAnswer: true,
        remainingCount: -1, // 无限
        isMember: true
      }
    }

    // 获取今日已答题次数
    const today = new Date().toISOString().split('T')[0]
    const result = await supabase.from('answer_records')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', today)

    const usedCount = result.count || 0
    const maxCount = 3
    const remainingCount = maxCount - usedCount

    return {
      canAnswer: remainingCount > 0,
      remainingCount,
      usedCount,
      isMember: false
    }
  }
}