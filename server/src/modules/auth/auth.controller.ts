import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信登录
   */
  @Post('login')
  async wechatLogin(@Body() body: { code: string }) {
    const result = await this.authService.wechatLogin(body.code || 'mock_code')
    return {
      code: 200,
      msg: '登录成功',
      data: result
    }
  }

  /**
   * 同意协议
   */
  @Post('agreement')
  async updateAgreement(@Body() body: {
    userId: string
    userAgreement: boolean
    privacyPolicy: boolean
    notificationPush: boolean
  }) {
    const user = await this.authService.updateAgreement(body.userId, {
      userAgreement: body.userAgreement,
      privacyPolicy: body.privacyPolicy,
      notificationPush: body.notificationPush
    })
    return {
      code: 200,
      msg: '协议已确认',
      data: user
    }
  }

  /**
   * 获取用户信息
   */
  @Get('user/:id')
  async getUserInfo(@Param('id') id: string) {
    const user = await this.authService.getUserInfo(id)
    return {
      code: 200,
      msg: '获取成功',
      data: user
    }
  }

  /**
   * 检查会员状态
   */
  @Get('member-status/:userId')
  async checkMemberStatus(@Param('userId') userId: string) {
    const status = await this.authService.checkMemberStatus(userId)
    return {
      code: 200,
      msg: '获取成功',
      data: status
    }
  }

  /**
   * 检查每日答题次数
   */
  @Get('answer-count/:userId')
  async checkDailyAnswerCount(@Param('userId') userId: string) {
    const result = await this.authService.checkDailyAnswerCount(userId)
    return {
      code: 200,
      msg: '获取成功',
      data: result
    }
  }
}