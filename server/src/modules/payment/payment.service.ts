import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

const supabase = getSupabaseClient()

@Injectable()
export class PaymentService {
  /**
   * 创建支付订单
   * 注意：实际微信支付需要企业资质，此处为模拟实现
   */
  async createOrder(userId: string, orderData: {
    type: 'member' | 'review'
    productId: string
    price: number
  }) {
    // 生成订单号
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8)}`
    
    // 创建订单记录
    const order = await supabase.from('purchase_orders').insert({
      id: orderId,
      user_id: userId,
      type: orderData.type,
      product_id: orderData.productId,
      price: orderData.price,
      status: 'pending',
      created_at: new Date().toISOString()
    }).select().single()

    if (order.error) {
      throw new Error(`创建订单失败: ${order.error.message}`)
    }

    // 模拟微信支付参数
    // 实际需要调用微信支付API获取prepay_id
    const mockPayParams = {
      appId: 'wx_mock_app_id',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: Math.random().toString(36).substring(2, 15),
      package: `prepay_id=wx_mock_prepay_${orderId}`,
      signType: 'RSA',
      paySign: 'mock_sign_value'
    }

    return {
      orderId,
      payParams: mockPayParams
    }
  }

  /**
   * 处理支付回调（模拟）
   */
  async handlePaymentNotify(orderId: string) {
    // 更新订单状态为已完成
    const order = await supabase.from('purchase_orders')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        transaction_id: `WX${Date.now()}`
      })
      .eq('id', orderId)
      .select()
      .single()

    if (order.error) {
      throw new Error(`更新订单失败: ${order.error.message}`)
    }

    // 根据订单类型处理权益
    if (order.data.type === 'member') {
      await this.activateMember(order.data.user_id, order.data.product_id)
    } else if (order.data.type === 'review') {
      await this.addReviewCount(order.data.user_id, 1)
    }

    return { success: true, order: order.data }
  }

  /**
   * 激活会员
   */
  private async activateMember(userId: string, productId: string) {
    // 根据产品ID确定会员类型和有效期
    let memberType: string
    let validDays: number
    let freeReviewCount: number

    switch (productId) {
      case 'monthly':
        memberType = 'monthly'
        validDays = 30
        freeReviewCount = 1
        break
      case 'quarterly':
        memberType = 'quarterly'
        validDays = 90
        freeReviewCount = 2
        break
      case 'yearly':
        memberType = 'yearly'
        validDays = 365
        freeReviewCount = 6
        break
      default:
        throw new Error('未知会员类型')
    }

    const expireAt = new Date()
    expireAt.setDate(expireAt.getDate() + validDays)

    // 更新用户会员状态
    await supabase.from('users')
      .upsert({
        id: userId,
        member_type: memberType,
        member_expire_at: expireAt.toISOString(),
        free_review_count: freeReviewCount,
        updated_at: new Date().toISOString()
      })
  }

  /**
   * 添加人工点评次数
   */
  private async addReviewCount(userId: string, count: number) {
    await supabase.rpc('increment_review_count', {
      user_id: userId,
      count: count
    })
  }

  /**
   * 获取用户购买记录
   */
  async getPurchases(userId: string) {
    const result = await supabase.from('purchase_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (result.error) {
      throw new Error(`获取购买记录失败: ${result.error.message}`)
    }

    return result.data || []
  }

  /**
   * 获取消费明细
   */
  async getExpenseDetail(userId: string, orderId: string) {
    const result = await supabase.from('purchase_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (result.error) {
      throw new Error(`获取消费明细失败: ${result.error.message}`)
    }

    return result.data
  }
}