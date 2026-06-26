import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { ReviewService } from './review.service'

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ==================== 用户端接口 ====================

  // 获取用户订单列表
  @Get('orders')
  async getUserOrders(@Query('userId') userId: string) {
    const orders = await this.reviewService.getUserOrders(userId || 'mock_user')
    return {
      code: 200,
      msg: 'success',
      data: orders,
    }
  }

  // 创建点评订单（上传答题）
  @Post('orders')
  async createOrder(
    @Body() body: {
      userId?: string
      mediaUrl: string
      mediaType: 'video' | 'audio'
      questionContent?: string
      questionType?: string
      userNote?: string
    }
  ) {
    const order = await this.reviewService.createOrder(
      body.userId || 'mock_user',
      body
    )
    return {
      code: 200,
      msg: '订单创建成功',
      data: order,
    }
  }

  // 获取点评详情
  @Get('orders/:id')
  async getReviewDetail(@Param('id') id: string) {
    const detail = await this.reviewService.getReviewDetail(parseInt(id))
    return {
      code: 200,
      msg: 'success',
      data: detail,
    }
  }

  // 用户评价老师
  @Post('orders/:id/rate')
  async rateReview(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string }
  ) {
    const result = await this.reviewService.rateReview(
      parseInt(id),
      body.rating,
      body.comment
    )
    return {
      code: 200,
      msg: '评价成功',
      data: result,
    }
  }

  // ==================== 老师端接口 ====================

  // 获取待接单列表
  @Get('admin/orders')
  async getOrders(@Query('status') status: string) {
    if (status === 'pending') {
      const orders = await this.reviewService.getPendingOrders()
      return { code: 200, msg: 'success', data: orders }
    } else if (status === 'accepted' || status === 'completed') {
      const orders = await this.reviewService.getTeacherOrders(1, status)
      return { code: 200, msg: 'success', data: orders }
    }
    return { code: 200, msg: 'success', data: [] }
  }

  // 老师接单
  @Post('admin/orders/:id/accept')
  async acceptOrder(@Param('id') id: string) {
    const result = await this.reviewService.acceptOrder(1, parseInt(id))
    return {
      code: 200,
      msg: '接单成功',
      data: result,
    }
  }

  // 完成点评
  @Post('admin/orders/:id/complete')
  async completeReview(
    @Param('id') id: string,
    @Body() body: {
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
    }
  ) {
    const result = await this.reviewService.completeReview(1, parseInt(id), body)
    return {
      code: 200,
      msg: '点评完成',
      data: result,
    }
  }

  // ==================== 初始化数据 ====================

  @Post('admin/seed')
  async seedTeachers() {
    const result = await this.reviewService.seedTeachers()
    return {
      code: 200,
      msg: 'success',
      data: result,
    }
  }

  // ==================== 超时处理 ====================

  @Post('admin/handle-timeout')
  async handleTimeoutOrders() {
    const result = await this.reviewService.handleTimeoutOrders()
    return {
      code: 200,
      msg: 'success',
      data: result,
    }
  }
}