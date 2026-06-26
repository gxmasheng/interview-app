import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * 获取题目列表
   */
  @Get()
  async getQuestions(@Query('type') type?: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const data = await this.questionsService.getQuestions(type, limitNum);
    return { data };
  }

  /**
   * 获取推荐题目（必须在 :id 路由之前）
   */
  @Get('recommended')
  async getRecommended(@Query('count') count?: string) {
    const countNum = count ? parseInt(count, 10) : 3;
    const data = await this.questionsService.getRecommendedQuestions(countNum);
    return { data };
  }

  /**
   * 获取模拟面试题目（随机抽取4道不同题型）
   */
  @Post('simulate')
  async getSimulateQuestions(@Body() body: { types?: string[] }) {
    const types = body.types || ['comprehensive', 'organizational', 'interpersonal', 'emergency'];
    const data = await this.questionsService.getSimulateQuestions(types);
    return { data };
  }

  /**
   * 获取单个题目详情
   */
  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return { data: null, error: '无效的题目ID' };
    }
    const data = await this.questionsService.getQuestionById(idNum);
    return { data };
  }

  /**
   * 初始化种子数据
   */
  @Post('seed')
  async seedQuestions() {
    const result = await this.questionsService.seedQuestions();
    return { data: result };
  }

  /**
   * 批量添加题目
   */
  @Post('batch')
  async batchAddQuestions(@Body() body: { questions: Array<{ title: string; type: string; difficulty?: string }> }) {
    const result = await this.questionsService.batchAddQuestions(body.questions);
    return { data: result };
  }
}