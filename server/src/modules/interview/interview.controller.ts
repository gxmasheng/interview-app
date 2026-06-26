import { Controller, Post, Body, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { InterviewService } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /**
   * AI评分接口
   * @param body 包含题目信息、答案等
   */
  @Post('score')
  async scoreAnswer(
    @Body()
    body: {
      questionId: number;
      questionType: string;
      questionTitle: string;
      answer: string;
      thinkingTime?: number;
      answerTime?: number;
      practiceMode?: string;
    }
  ) {
    // 单项练习评分：总分20分，仅对答题内容评分
    const scoreResult = await this.interviewService.scoreSingleAnswer(
      body.questionType,
      body.questionTitle,
      body.answer
    );

    // 调用AI点评（单项练习版本）
    const feedback = await this.interviewService.generateSingleFeedback(
      body.questionType,
      body.questionTitle,
      body.answer,
      scoreResult
    );

    // 保存答题记录
    const record = await this.interviewService.saveAnswerRecord(
      body.questionId,
      body.answer,
      body.practiceMode || 'single',
      body.thinkingTime || 180,
      body.answerTime || 180,
      scoreResult,
      feedback
    );

    return {
      data: {
        score: scoreResult,
        feedback: feedback,
        recordId: record[0]?.id,
      },
    };
  }

  /**
   * 仅获取评分（不保存）
   */
  @Post('score-only')
  async scoreOnly(
    @Body()
    body: {
      questionType: string;
      questionTitle: string;
      answer: string;
    }
  ) {
    const scoreResult = await this.interviewService.scoreAnswer(
      body.questionType,
      body.questionTitle,
      body.answer
    );

    return { data: scoreResult };
  }

  /**
   * 仅获取点评（不保存）
   */
  @Post('feedback-only')
  async feedbackOnly(
    @Body()
    body: {
      questionType: string;
      questionTitle: string;
      answer: string;
      scoreResult: any;
    }
  ) {
    const feedback = await this.interviewService.generateFeedback(
      body.questionType,
      body.questionTitle,
      body.answer,
      body.scoreResult
    );

    return { data: feedback };
  }

  /**
   * 模拟面试评分（4题完整评分）
   */
  @Post('simulate-score')
  async simulateScore(
    @Body()
    body: {
      questions: any[];
      recordings?: string[];
      answers?: any[]; // 文字答案（H5端使用，可以是字符串数组或对象数组）
      sessionId: string;
    }
  ) {
    // 检查是否有有效答题内容
    const hasRecordings = body.recordings && body.recordings.length > 0;
    // 支持字符串数组或对象数组
    const hasAnswers = body.answers && body.answers.some(a => {
      if (typeof a === 'string') return a.trim().length > 0;
      if (a && typeof a === 'object') return (a.content || a.text || '').trim().length > 0;
      return false;
    });
    
    if (!hasRecordings && !hasAnswers) {
      return {
        code: 400,
        msg: '未检测到答题内容，无法进行评分。请在小程序中使用录音功能，或在H5端输入文字答案。',
        data: null
      };
    }

    const result = await this.interviewService.scoreSimulateInterview(
      body.questions,
      body.sessionId,
      body.answers || []
    );

    return { code: 200, msg: 'success', data: result };
  }

  /**
   * 获取答题记录
   */
  @Get('records')
  async getRecords(@Query('type') type?: string, @Query('limit') limit?: number) {
    const records = await this.interviewService.getAnswerRecords(type, limit || 20);
    return { data: records };
  }

  /**
   * 获取模拟面试历史记录
   */
  @Get('simulate-records')
  async getSimulateRecords(@Query('limit') limit?: number) {
    const records = await this.interviewService.getSimulateRecords(limit || 20);
    return { data: records };
  }

  /**
   * 获取评分报告详情
   */
  @Get('report/:id')
  async getReport(@Param('id') id: string) {
    const report = await this.interviewService.getReportById(parseInt(id, 10));
    return { data: report };
  }

  /**
   * 更新收藏状态
   */
  @Put('records/:id/favorite')
  async updateFavorite(
    @Param('id') id: string,
    @Body() body: { isFavorited: boolean; favoriteType: string }
  ) {
    const result = await this.interviewService.updateFavorite(
      parseInt(id, 10),
      body.isFavorited,
      body.favoriteType
    );
    return { data: result };
  }

  /**
   * 删除模拟面试记录
   */
  @Delete('simulate-records/:id')
  async deleteSimulateRecord(@Param('id') id: string) {
    const result = await this.interviewService.deleteSimulateRecord(parseInt(id, 10));
    return { data: result };
  }
}