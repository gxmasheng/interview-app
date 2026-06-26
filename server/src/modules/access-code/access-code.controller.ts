import { Controller, Post, Get, Body, Query } from '@nestjs/common'
import { AccessCodeService } from './access-code.service'

@Controller('access-code')
export class AccessCodeController {
  constructor(private service: AccessCodeService) {}

  // 用户激活访问码
  @Post('activate')
  async activate(@Body() body: { code: string; userId?: string }) {
    // 生成临时用户ID（实际应用中应从登录态获取）
    const userId = body.userId || `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    const result = await this.service.activateCode(body.code.toUpperCase(), userId)
    
    if (result.success) {
      return {
        code: 200,
        msg: '激活成功',
        data: result,
      }
    } else {
      return {
        code: 400,
        msg: result.message,
        data: null,
      }
    }
  }

  // 检查会员状态
  @Get('membership')
  async checkMembership(@Query('userId') userId?: string) {
    const uid = userId || 'guest'
    const result = await this.service.checkMembership(uid)
    
    return {
      code: 200,
      msg: '查询成功',
      data: result,
    }
  }

  // 批量生成访问码（后台管理）
  @Post('generate')
  async generateCodes(@Body() body: {
    memberType: string
    durationDays: number
    freeReviews: number
    count: number
    expiresDays?: number
    remark?: string
  }) {
    const result = await this.service.generateCodes(body)
    
    return {
      code: 200,
      msg: '生成成功',
      data: result,
    }
  }

  // 查询访问码列表（后台管理）
  @Get('list')
  async getCodesList(@Query() query: {
    status?: string
    batchNo?: string
    memberType?: string
    page?: string
    pageSize?: string
  }) {
    const result = await this.service.getCodesList({
      status: query.status,
      batchNo: query.batchNo,
      memberType: query.memberType,
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
    })
    
    return {
      code: 200,
      msg: '查询成功',
      data: result,
    }
  }
}