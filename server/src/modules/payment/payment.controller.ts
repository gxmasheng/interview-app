import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建支付订单
   */
  @Post('create')
  async createOrder(@Body() body: {
    userId: string
    type: 'member' | 'review'
    productId: string
    price: number
  }) {
    const result = await this.paymentService.createOrder(body.userId, body)
    return {
      code: 200,
      msg: '订单创建成功',
      data: result
    }
  }

  /**
   * 模拟支付回调
   */
  @Post('notify/:orderId')
  async handleNotify(@Param('orderId') orderId: string) {
    const result = await this.paymentService.handlePaymentNotify(orderId)
    return {
      code: 200,
      msg: '支付处理成功',
      data: result
    }
  }

  /**
   * 获取购买记录
   */
  @Get('purchases')
  async getPurchases(@Query('userId') userId: string) {
    const purchases = await this.paymentService.getPurchases(userId || 'mock_user')
    return {
      code: 200,
      msg: '获取成功',
      data: purchases
    }
  }

  /**
   * 获取消费明细
   */
  @Get('expenses/:id')
  async getExpenseDetail(@Param('id') id: string, @Query('userId') userId: string) {
    const detail = await this.paymentService.getExpenseDetail(userId || 'mock_user', id)
    return {
      code: 200,
      msg: '获取成功',
      data: detail
    }
  }
}