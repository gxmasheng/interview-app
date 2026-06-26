import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

const supabase = getSupabaseClient()

@Injectable()
export class AccessCodeService {
  // 激活访问码
  async activateCode(code: string, userId: string) {
    // 查询访问码
    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !accessCode) {
      return { success: false, message: '访问码不存在' }
    }

    // 检查是否已使用
    if (accessCode.is_used) {
      return { success: false, message: '访问码已被使用' }
    }

    // 检查是否过期
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return { success: false, message: '访问码已过期' }
    }

    // 计算会员到期时间
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + (accessCode.duration_days || 30))

    // 创建会员记录
    const { error: memberError } = await supabase.from('memberships').insert({
      user_id: userId,
      member_type: accessCode.member_type,
      free_reviews: accessCode.free_reviews || 1,
      used_reviews: 0,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      is_active: true,
      payment_channel: 'access_code',
      payment_amount: 0,
      created_at: new Date().toISOString()
    })

    if (memberError) {
      console.error('创建会员记录失败:', memberError)
      return { success: false, message: '激活失败，请稍后重试' }
    }

    // 更新访问码状态
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', accessCode.id)

    if (updateError) {
      console.error('更新访问码状态失败:', updateError)
    }

    return {
      success: true,
      message: '激活成功',
      memberType: accessCode.member_type,
      endDate: endDate.toLocaleDateString('zh-CN'),
      freeReviews: accessCode.free_reviews || 1,
    }
  }

  // 批量生成访问码
  async generateCodes(params: {
    memberType: string
    durationDays: number
    freeReviews: number
    count: number
    expiresDays?: number
    remark?: string
  }) {
    const batchNo = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const codes: string[] = []
    const expiresAt = params.expiresDays
      ? new Date(Date.now() + params.expiresDays * 24 * 60 * 60 * 1000)
      : null

    // 生成指定数量的访问码
    for (let i = 0; i < params.count; i++) {
      const code = this.generateRandomCode(8)
      codes.push(code)

      const { error: insertError } = await supabase.from('access_codes').insert({
        code,
        member_type: params.memberType,
        duration_days: params.durationDays,
        free_reviews: params.freeReviews,
        batch_no: batchNo,
        remark: params.remark,
        is_used: false,
        expires_at: expiresAt?.toISOString(),
        created_at: new Date().toISOString()
      })
      
      if (insertError) {
        console.error('插入访问码失败:', insertError)
      }
    }

    return { batchNo, codes, count: params.count }
  }

  // 查询访问码列表
  async getCodesList(params: {
    status?: string
    batchNo?: string
    memberType?: string
    page?: number
    pageSize?: number
  }) {
    let query = supabase.from('access_codes').select('*', { count: 'exact' })

    if (params.status === 'used') {
      query = query.eq('is_used', true)
    } else if (params.status === 'unused') {
      query = query.eq('is_used', false)
    }
    if (params.batchNo) {
      query = query.eq('batch_no', params.batchNo)
    }
    if (params.memberType) {
      query = query.eq('member_type', params.memberType)
    }

    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const offset = (page - 1) * pageSize

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('查询访问码列表失败:', error)
      return { data: [], total: 0 }
    }

    return { data, total: count }
  }

  // 检查用户会员状态
  async checkMembership(userId: string) {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('end_at', new Date().toISOString())
      .order('end_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      return { isMember: false }
    }

    const membership = data[0]
    return {
      isMember: true,
      memberType: membership.member_type,
      startAt: membership.start_at,
      endAt: membership.end_at,
      freeReviews: membership.free_reviews,
      usedReviews: membership.used_reviews,
      remainingReviews: membership.free_reviews - membership.used_reviews,
    }
  }

  // 生成随机访问码
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除易混淆字符
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}