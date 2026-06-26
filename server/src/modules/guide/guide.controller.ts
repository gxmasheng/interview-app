import { Controller, Get, Query, Param } from '@nestjs/common'
import { GuideService } from './guide.service'

@Controller('guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  //获取文章列表
  @Get('articles')
  async getArticles(@Query('category') category?: string) {
    return this.guideService.getArticles(category)
  }

  // 获取单篇文章
  @Get('article/:id')
  async getArticle(@Param('id') id: string) {
    return this.guideService.getArticle(id)
  }

  // 搜索文章
  @Get('search')
  async searchArticles(@Query('keyword') keyword: string) {
    return this.guideService.searchArticles(keyword)
  }
}