import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

const supabase = getSupabaseClient()

@Injectable()
export class ReviewService {
  // ==================== 用户端接口 ====================

  // 获取用户订单列表
  async getUserOrders(userId: string) {
    const result = await supabase.from('review_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (result.error) {
      throw new Error(`获取订单列表失败: ${result.error.message}`)
    }
    
    return result.data || []
  }

  // 创建点评订单
  async createOrder(userId: string, data: {
    mediaUrl: string
    mediaType: 'video' | 'audio'
    questionContent?: string
    questionType?: string
    userNote?: string
  }) {
    // 生成订单号
    const orderNo = `RV${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    // 检查会员是否有免费次数
    const member = await this.checkUserMembership(userId)
    const paymentStatus = member && member.free_review_count > member.used_review_count ? 'free' : 'unpaid'
    
    // 计算截止时间（默认24小时）
    const deliveryHours = 24
    const deadlineAt = new Date(Date.now() + deliveryHours * 60 * 60 * 1000)
    
    const result = await supabase.from('review_orders').insert({
      order_no: orderNo,
      user_id: userId,
      media_url: data.mediaUrl,
      media_type: data.mediaType,
      question_content: data.questionContent,
      question_type: data.questionType,
      user_note: data.userNote,
      status: 'pending',
      delivery_hours: deliveryHours,
      deadline_at: deadlineAt.toISOString(),
      payment_status: paymentStatus,
      created_at: new Date().toISOString()
    }).select().single()
    
    if (result.error) {
      throw new Error(`创建订单失败: ${result.error.message}`)
    }
    
    // 自动分配老师（如果有在线老师）
    await this.autoAssignTeacher(result.data.id)
    
    return result.data
  }

  // 获取点评详情
  async getReviewDetail(orderId: number) {
    const order = await supabase.from('review_orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (order.error || !order.data) return null
    
    // 获取点评记录
    if (order.data.review_record_id) {
      const record = await supabase.from('review_records')
        .select('*')
        .eq('id', order.data.review_record_id)
        .single()
      
      return { ...order.data, reviewRecord: record.data }
    }
    
    return order.data
  }

  // 用户评价老师
  async rateReview(orderId: number, rating: number, comment?: string) {
    const order = await supabase.from('review_orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (order.error) {
      throw new Error(`获取订单失败: ${order.error.message}`)
    }
    
    if (order.data?.review_record_id) {
      await supabase.from('review_records')
        .update({ 
          user_rating: rating,
          user_comment: comment,
        })
        .eq('id', order.data.review_record_id)
      
      // 更新老师平均评分
      const teacherId = order.data.teacher_id
      if (teacherId) {
        const teacherRecords = await supabase.from('review_records')
          .select('user_rating')
          .eq('teacher_id', teacherId)
        
        if (teacherRecords.data && teacherRecords.data.length > 0) {
          const avgRating = teacherRecords.data.reduce((sum: number, r: any) => sum + (r.user_rating || 5), 0) / teacherRecords.data.length
          await supabase.from('teachers')
            .update({ avg_rating: Math.round(avgRating) })
            .eq('id', teacherId)
        }
      }
    }
    
    return { success: true }
  }

  // ==================== 会员管理 ====================

  // 检查用户会员状态
  async checkUserMembership(userId: string) {
    const result = await supabase.from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('end_at', new Date().toISOString())
      .limit(1)
    
    return result.data?.[0] || null
  }

  // 使用免费点评次数
  async useFreeReview(userId: string) {
    const member = await this.checkUserMembership(userId)
    if (member && member.free_review_count > member.used_review_count) {
      await supabase.from('memberships')
        .update({ used_review_count: member.used_review_count + 1 })
        .eq('id', member.id)
      return true
    }
    return false
  }

  // ==================== 老师端接口 ====================

  // 获取待接单列表
  async getPendingOrders() {
    const result = await supabase.from('review_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20)
    
    return result.data || []
  }

  // 获取老师已接单列表
  async getTeacherOrders(teacherId: number, status: string) {
    const result = await supabase.from('review_orders')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(20)
    
    return result.data || []
  }

  // 老师接单
  async acceptOrder(teacherId: number, orderId: number) {
    // 检查订单状态
    const order = await supabase.from('review_orders')
      .select('*')
      .eq('id', orderId)
      .eq('status', 'pending')
      .single()
    
    if (order.error || !order.data) {
      throw new Error('订单不存在或已被接单')
    }
    
    // 更新订单状态
    const now = new Date()
    await supabase.from('review_orders')
      .update({
        teacher_id: teacherId,
        status: 'accepted',
        accepted_at: now.toISOString(),
      })
      .eq('id', orderId)
    
    // 更新老师待处理数
    const teacher = await supabase.from('teachers')
      .select('pending_orders')
      .eq('id', teacherId)
      .single()
    
    if (teacher.data) {
      await supabase.from('teachers')
        .update({ pending_orders: teacher.data.pending_orders + 1 })
        .eq('id', teacherId)
    }
    
    return { success: true }
  }

  // 完成点评
  async completeReview(teacherId: number, orderId: number, data: {
    scores: any
    totalScore: number
    scoreLevel: string
    timeMarks: any[]
    textFeedback: string
    audioUrl?: string
    highlights?: string
    improvements?: string
    answerFramework?: string
    referenceAnswer?: string
  }) {
    // 创建点评记录
    const record = await supabase.from('review_records').insert({
      order_id: orderId,
      teacher_id: teacherId,
      scores: data.scores,
      total_score: data.totalScore,
      score_level: data.scoreLevel,
      time_marks: data.timeMarks,
      text_feedback: data.textFeedback,
      audio_feedback_url: data.audioUrl,
      highlights: data.highlights,
      improvements: data.improvements,
      answer_framework: data.answerFramework,
      reference_answer: data.referenceAnswer,
      created_at: new Date().toISOString()
    }).select().single()
    
    if (record.error) {
      throw new Error(`创建点评记录失败: ${record.error.message}`)
    }
    
    // 更新订单状态
    const now = new Date()
    await supabase.from('review_orders')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        review_record_id: record.data.id,
      })
      .eq('id', orderId)
    
    // 更新老师统计
    const teacher = await supabase.from('teachers')
      .select('completed_orders, pending_orders')
      .eq('id', teacherId)
      .single()
    
    if (teacher.data) {
      await supabase.from('teachers')
        .update({ 
          completed_orders: teacher.data.completed_orders + 1,
          pending_orders: teacher.data.pending_orders - 1,
        })
        .eq('id', teacherId)
    }
    
    // 发送通知给用户
    await this.sendNotification('review_completed', orderId)
    
    return record.data
  }

  // ==================== 自动分配老师 ====================

  async autoAssignTeacher(orderId: number) {
    // 查找在线且待处理订单少的老师
    const result = await supabase.from('teachers')
      .select('*')
      .eq('is_online', true)
      .eq('is_active', true)
      .order('pending_orders', { ascending: true })
      .limit(5)
    
    if (result.data && result.data.length > 0) {
      // 选择待处理订单最少的老师
      const teacher = result.data[0]
      await this.acceptOrder(teacher.id, orderId)
    }
  }

  // ==================== 超时转派 ====================

  async handleTimeoutOrders() {
    const now = new Date()
    
    // 查找超时订单
    const result = await supabase.from('review_orders')
      .select('*')
      .eq('status', 'accepted')
      .lt('deadline_at', now.toISOString())
    
    if (!result.data) return { handled: 0 }
    
    for (const order of result.data) {
      // 转派给其他老师
      await supabase.from('review_orders')
        .update({ status: 'timeout' })
        .eq('id', order.id)
      
      // 自动分配新老师
      await this.autoAssignTeacher(order.id)
      
      // 发送通知
      await this.sendNotification('order_timeout', order.id)
    }
    
    return { handled: result.data.length }
  }

  // ==================== 通知 ====================

  async sendNotification(type: string, relatedId: number) {
    // 查询订单用户
    const order = await supabase.from('review_orders')
      .select('user_id')
      .eq('id', relatedId)
      .single()
    
    if (order.error || !order.data) return
    
    // 创建应用内通知
    const notificationContent: Record<string, string> = {
      review_completed: '您的答题点评已完成，点击查看详细报告。',
      order_timeout: '由于老师回复超时，您的订单已转派给其他老师。',
      membership_expire: '您的会员即将到期，请及时续费。',
    }
    
    await supabase.from('notifications').insert({
      user_id: order.data.user_id,
      type: type,
      title: type === 'review_completed' ? '点评完成' : type === 'order_timeout' ? '订单转派' : '会员到期',
      content: notificationContent[type] || '',
      related_id: relatedId,
      created_at: new Date().toISOString()
    })
    
    return { success: true }
  }

  // ==================== 初始化老师数据 ====================

  async seedTeachers() {
    const existing = await supabase.from('teachers').select('id').limit(1)
    if (existing.data && existing.data.length > 0) return { message: '老师数据已存在' }
    
    await supabase.from('teachers').insert([
      {
        name: '张老师',
        avatar: '',
        introduction: '资深公务员面试培训师，10年教学经验',
        expertise: ['综合分析', '组织协调'],
        is_online: true,
        is_active: true,
        pending_orders: 0,
        completed_orders: 0,
        avg_rating: 5,
        created_at: new Date().toISOString()
      },
      {
        name: '李老师',
        avatar: '',
        introduction: '面试专家，曾任省级面试考官',
        expertise: ['人际沟通', '应急应变'],
        is_online: true,
        is_active: true,
        pending_orders: 0,
        completed_orders: 0,
        avg_rating: 5,
        created_at: new Date().toISOString()
      },
      {
        name: '王老师',
        avatar: '',
        introduction: '公考面试培训专家，擅长高分答题框架',
        expertise: ['综合分析', '应急应变'],
        is_online: false,
        is_active: true,
        pending_orders: 0,
        completed_orders: 0,
        avg_rating: 5,
        created_at: new Date().toISOString()
      },
    ])
    
    return { message: '老师数据初始化成功' }
  }
}