import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
} from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 获取统计数据
  @Get('statistics')
  async getStatistics() {
    const data = await this.adminService.getStatistics()
    return { code: 200, data }
  }

  // 用户管理
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '20', 10)
    const data = await this.adminService.getUsers(pageNum, limitNum)
    return { code: 200, data }
  }

  // 订单管理
  @Get('orders')
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '20', 10)
    const data = await this.adminService.getOrders(pageNum, limitNum, status)
    return { code: 200, data }
  }

  // 老师管理
  @Get('teachers')
  async getTeachers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '20', 10)
    const data = await this.adminService.getTeachers(pageNum, limitNum)
    return { code: 200, data }
  }

  // 公告管理
  @Get('announcements')
  async getAnnouncements(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10)
    const limitNum = parseInt(limit || '20', 10)
    const data = await this.adminService.getAnnouncements(pageNum, limitNum)
    return { code: 200, data }
  }

  @Post('announcements')
  async createAnnouncement(
    @Body() body: { title: string; content: string },
  ) {
    const data = await this.adminService.createAnnouncement(
      body.title,
      body.content,
    )
    return { code: 200, data, msg: '公告创建成功' }
  }

  // 系统设置
  @Get('settings')
  async getSettings() {
    const data = await this.adminService.getSettings()
    return { code: 200, data }
  }

  @Put('settings')
  async updateSettings(@Body() body: Record<string, any>) {
    const data = await this.adminService.updateSettings(body)
    return { code: 200, data, msg: '设置更新成功' }
  }

  // 查询用户信息（手动开通会员用）
  @Get('user/:userId')
  async getUserById(@Param('userId') userId: string) {
    const data = await this.adminService.getUserById(userId)
    return { code: 200, data }
  }

  // 手动开通会员
  @Post('open-member')
  async openMember(
    @Body() body: { userId: string; memberType: string; days: number; freeReviews: number },
  ) {
    const data = await this.adminService.openMember(
      body.userId,
      body.memberType,
      body.days,
      body.freeReviews,
    )
    return { code: 200, data, msg: '会员开通成功' }
  }
}