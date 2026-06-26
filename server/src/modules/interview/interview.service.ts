import { Injectable } from '@nestjs/common';
import { LLMClient, Config, Message } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 单项练习评分提示词（总分20分，仅对答题内容评分）
const SINGLE_SCORING_SYSTEM_PROMPT = `你是一位专业的公务员结构化面试评委，需要对考生的单项练习答案进行评分。

评分标准（总分20分，分好、中、差三档）：
- 好(16～20分)：答题内容完整、逻辑清晰、分析深入、观点明确，能够准确把握题目核心要求，展现出良好的思维能力。
- 中(11～15分)：答题内容基本完整，有一定的逻辑性，但分析不够深入或观点不够明确，对题目核心要求的把握基本到位。
- 巙(0～10分)：答题内容不完整或过于空泛，逻辑混乱，缺乏分析深度，观点模糊，未能把握题目核心要求。

注意：单项练习仅对答题内容质量评分，不对语言表达、仪表仪态评分。

输出格式要求（必须严格遵循JSON格式）：
{
  "score": 分数(0-20),
  "level": "好/中/差",
  "evaluation": "具体评价（指出答题的优点和不足）",
  "suggestions": ["改进建议1", "改进建议2"],
  "referenceAnswer": "参考答题思路（简短，不超过100字）"
}`;

// 全真模拟评分系统提示词（六维度评分）
const SCORING_SYSTEM_PROMPT = `你是一位专业的公务员结构化面试评委，需要对考生的答案进行六维度评分。

评分维度和标准如下：

1. 综合分析能力（20分）：观点明确、逻辑清晰、分析全面、有深度。
   - 好(16～20分)：能围绕题干信息，从多方面辩证、客观地进行分析，能够透过现象看本质。整体遵循"表态—解读现象—分析原因—提出对策—总结升华"答题框架，思路清晰，说理透彻。
   - 中(11～15分)：对题干信息的分析基本到位，观点基本合理，有基本的层次，但看问题的角度不够全面，联系实际论述一般。
   - 巙(0～10分)：认识片面，缺乏思路，条理性差，内容简单。

2. 组织协调能力（20分）：准确理解工作目标和组织意图，根据实际情况，及时有效地完成任务的能力。
   - 好(16～20分)：能充分了解工作目标和组织意图，采取有效措施执行任务，充分考虑执行过程中可能遇到的问题，并提出解决方案，顺利完成任务。
   - 中(11～15分)：能够了解工作目标和组织意图，能选取比较有效的措施执行任务，但考虑问题不够周全，能够提出相应的解决方案，尚能完成任务。
   - 巙(0～10分)：未能了解工作目标和组织意图，选取的措施可行性较差，思路混乱，无法完成任务。

3. 人际沟通能力（20分）：换位思考、沟通有效、化解矛盾。
   - 好（16～20分）：能针对具体情况，沉着冷静、积极主动地与相关人员沟通，虚心听取意见，有效管控分歧，矛盾化解效果好。
   - 中（11～15分）：能与相关人员进行一定沟通，但沟通方式不够灵活、恰当。
   - 差（0～10分）：沟通方法死板，考虑不周全，沟通效果差。

4. 应急应变能力（20分）：反应迅速、措施可行、处理得当。
   - 好（16～20分）：能针对实际情况，以"稳秩序、解情绪、办好事、堵漏洞"的逻辑进行处置，态度诚恳、语言规范、步骤清晰、说服力强，效果明显。
   - 中（11～15分）：针对实际情况，基本能控制局面，耐心地与相关人员沟通，但沟通方式不够灵活、恰当，考虑不够周到，尚能在一定程度上缓解事态进一步恶化升级。
   - 巙(0～10分)：缺少有效地处置方式，沟通意识或沟通方式不当,考虑不周全,无法有效解决问题。

5. 语言表达能力（10分）：AI评分统一默认8分。
6. 举止仪表（10分）：AI评分统一默认8分。

请根据题目类型和考生答案，对各维度进行评分，并给出具体评价。

输出格式要求（必须严格遵循JSON格式）：
{
  "dimensions": {
    "comprehensive": { "score": 数字, "level": "好/中/差", "evaluation": "具体评价" },
    "organizational": { "score": 数字, "level": "好/中/差", "evaluation": "具体评价" },
    "interpersonal": { "score": 数字, "level": "好/中/差", "evaluation": "具体评价" },
    "emergency": { "score": 数字, "level": "好/中/差", "evaluation": "具体评价" },
    "expression": { "score": 8, "level": "好", "evaluation": "AI评分默认值" },
    "etiquette": { "score": 8, "level": "好", "evaluation": "AI评分默认值" }
  },
  "totalScore": 总分(各维度分数之和),
  "overallLevel": "好/中/差",
  "summary": "整体评价总结"
}`;

// 点评系统提示词
const FEEDBACK_SYSTEM_PROMPT = `你是一位专业的公务员结构化面试培训师，需要对考生的答案进行深度点评和指导。

请根据以下评分结果和题目要求，生成专业点评：

输出格式要求（必须严格遵循JSON格式）：
{
  "highlights": [
    "答题亮点1",
    "答题亮点2",
    "答题亮点3"
  ],
  "weaknesses": [
    "需要改进的地方1",
    "需要改进的地方2",
    "需要改进的地方3"
  ],
  "suggestions": [
    "具体改进建议1",
    "具体改进建议2",
    "具体改进建议3"
  ],
  "referenceThought": "高分答题思路参考（不提供模板化答案，引导自主思考）",
  "knowledgeGaps": ["需要补充的知识点或学习资料"]
}`;

@Injectable()
export class InterviewService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * 单项练习评分：总分20分，仅对答题内容评分
   */
  async scoreSingleAnswer(questionType: string, questionTitle: string, answer: string) {
    const messages: Message[] = [
      { role: 'system', content: SINGLE_SCORING_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `题目类型：${questionType}
题目内容：${questionTitle}
考生答案：${answer}

请根据评分标准，对考生答案进行评分（总分20分），并输出JSON格式的评分结果。`,
      },
    ];

    try {
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3,
      });

      const scoreResult = this.parseJsonResponse(response.content);
      return scoreResult;
    } catch (error) {
      console.error('单项练习评分失败:', error);
      // API不可用时返回默认评分
      return {
        score: 12,
        level: '中',
        evaluation: '评分服务暂时不可用，这是默认评分。您的答案已记录，请稍后重试获取真实评分。',
        suggestions: ['建议稍后重试评分功能', '可以继续练习其他题目'],
        referenceAnswer: '评分服务暂时不可用，无法生成参考答案。',
        strengths: ['答案内容已记录'],
        weaknesses: ['评分服务暂时不可用'],
        improvements: ['请稍后重试'],
      };
    }
  }

  /**
   * AI评分：根据题目和答案进行六维度评分（全真模拟使用）
   */
  async scoreAnswer(questionType: string, questionTitle: string, answer: string) {
    const messages: Message[] = [
      { role: 'system', content: SCORING_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `题目类型：${questionType}
题目内容：${questionTitle}
考生答案：${answer}

请根据评分标准，对考生答案进行六维度评分，并输出JSON格式的评分结果。`,
      },
    ];

    try {
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3, // 低温度保证评分一致性
      });

      // 解析JSON响应
      const scoreResult = this.parseJsonResponse(response.content);
      return scoreResult;
    } catch (error) {
      console.error('AI评分失败:', error);
      // API不可用时返回默认评分
      return {
        comprehensiveAnalysis: { score: 14, evaluation: '综合分析能力评分暂时不可用' },
        organizationalCoordination: { score: 14, evaluation: '组织协调能力评分暂时不可用' },
        interpersonalCommunication: { score: 14, evaluation: '人际沟通能力评分暂时不可用' },
        emergencyResponse: { score: 14, evaluation: '应急应变能力评分暂时不可用' },
        languageExpression: { score: 8, evaluation: '语言表达能力评分暂时不可用' },
        appearanceEtiquette: { score: 8, evaluation: '仪表仪态评分暂时不可用' },
        totalScore: 64,
        overallLevel: '中',
        overallEvaluation: '评分服务暂时不可用，这是默认评分。您的答案已记录，请稍后重试获取真实评分。',
        suggestions: ['建议稍后重试评分功能', '可以继续练习其他题目'],
        strengths: ['答案内容已记录'],
        weaknesses: ['评分服务暂时不可用'],
        improvements: ['请稍后重试'],
      };
    }
  }

  /**
   * 单项练习点评：针对20分评分的点评
   */
  async generateSingleFeedback(
    questionType: string,
    questionTitle: string,
    answer: string,
    scoreResult: any
  ) {
    const singleFeedbackPrompt = `你是一位专业的公务员面试评分专家。请根据考生答案的评分结果，生成简洁的点评和建议。

输出JSON格式：
{
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["改进建议1", "改进建议2"],
  "referenceAnswer": "高分参考答案框架（不要给出模板化答案，引导自主思考）"
}`;

    const messages: Message[] = [
      { role: 'system', content: singleFeedbackPrompt },
      {
        role: 'user',
        content: `题目类型：${questionType}
题目内容：${questionTitle}
考生答案：${answer}
评分结果：${JSON.stringify(scoreResult)}

请根据以上信息，生成专业点评和指导建议，输出JSON格式。`,
      },
    ];

    try {
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.5,
      });

      return this.parseJsonResponse(response.content);
    } catch (error) {
      console.error('单项练习点评失败:', error);
      // 返回默认点评
      return {
        strengths: ['答题态度认真'],
        weaknesses: ['需要进一步完善答题内容'],
        suggestions: ['建议多练习同类题型'],
        referenceAnswer: '请结合题目要求，从多角度进行分析和回答。',
      };
    }
  }

  /**
   * 专业点评：根据评分结果生成点评内容（全真模拟使用）
   */
  async generateFeedback(
    questionType: string,
    questionTitle: string,
    answer: string,
    scoreResult: any
  ) {
    const messages: Message[] = [
      { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `题目类型：${questionType}
题目内容：${questionTitle}
考生答案：${answer}
评分结果：${JSON.stringify(scoreResult)}

请根据以上信息，生成专业点评和指导建议，输出JSON格式。`,
      },
    ];

    try {
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.5,
      });

      // 解析JSON响应
      const feedbackResult = this.parseJsonResponse(response.content);
      return feedbackResult;
    } catch (error) {
      console.error('生成点评失败:', error);
      throw new Error(`生成点评失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 保存答题记录
   */
  async saveAnswerRecord(
    questionId: number,
    answerText: string,
    practiceMode: string,
    thinkingTime: number,
    answerTime: number,
    scores: any,
    feedback: any
  ) {
    const client = getSupabaseClient();

    // 计算总分
    const totalScore = Object.values(scores.dimensions || {}).reduce(
      (sum: number, dim: any) => sum + (dim.score || 0),
      0
    ) as number;

    // 判断总体档位
    let overallLevel = 'medium';
    if (totalScore >= 80) overallLevel = 'good';
    else if (totalScore < 60) overallLevel = 'poor';

    const { data, error } = await client
      .from('answer_records')
      .insert({
        question_id: questionId,
        answer_text: answerText,
        practice_mode: practiceMode,
        thinking_time: thinkingTime,
        answer_time: answerTime,
        scores: scores,
        total_score: totalScore,
        score_level: overallLevel,
        feedback: JSON.stringify(feedback),
      })
      .select();

    if (error) {
      throw new Error(`保存答题记录失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取答题记录
   */
  async getAnswerRecords(favoriteType?: string, limit: number = 20) {
    const client = getSupabaseClient();

    let query = client
      .from('answer_records')
      .select('*, questions(type, title)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (favoriteType === 'error') {
      query = query.eq('favorite_type', 'error');
    } else if (favoriteType === 'good') {
      query = query.eq('favorite_type', 'good');
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`获取答题记录失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新收藏状态
   */
  async updateFavorite(recordId: number, isFavorited: boolean, favoriteType: string) {
    const client = getSupabaseClient();

    const { error } = await client
      .from('answer_records')
      .update({
        is_favorited: isFavorited,
        favorite_type: isFavorited ? favoriteType : null,
      })
      .eq('id', recordId);

    if (error) {
      throw new Error(`更新收藏状态失败: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * 解析JSON响应（处理可能的格式问题）
   */
  private parseJsonResponse(content: string): any {
    try {
      // 尝试直接解析
      return JSON.parse(content);
    } catch (e) {
      // 尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('JSON解析失败:', content);
          throw new Error('AI返回格式异常，无法解析');
        }
      }
      throw new Error('AI返回内容无有效JSON');
    }
  }

  /**
   * 模拟面试评分（4题完整评分）
   * 支持录音转文字答案或直接文字答案
   * answers 可以是字符串数组或对象数组[{questionId, content}]
   */
  async scoreSimulateInterview(questions: any[], sessionId: string, answers: any[] = []) {
    // 对每道题进行评分
    const scoreResults: any[] = [];
    let totalScore = 0;
    const dimensionScores: Record<string, number> = {
      comprehensive: 0,
      organizational: 0,
      interpersonal: 0,
      emergency: 0,
      expression: 8,
      appearance: 8,
    };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      // 支持两种答案格式：字符串或对象
      let answerContent = '';
      if (typeof answers[i] === 'string') {
        answerContent = answers[i];
      } else if (answers[i] && typeof answers[i] === 'object') {
        answerContent = answers[i].content || answers[i].text || '';
      }
      
      // 如果有文字答案，调用AI评分
      if (answerContent.trim().length > 0) {
        try {
          const aiScore = await this.scoreAnswer(q.type, q.title, answerContent);
          const typeToDimension: Record<string, string> = {
            comprehensive: 'comprehensive',
            organizational: 'organizational',
            interpersonal: 'interpersonal',
            emergency: 'emergency',
          };
          const dimKey = typeToDimension[q.type as string];
          if (dimKey && aiScore.dimensions) {
            const dim = aiScore.dimensions[dimKey as keyof typeof aiScore.dimensions];
            if (dim) {
              (dimensionScores as Record<string, number>)[dimKey] = dim.score;
            }
          }
          
          scoreResults.push({
            questionIndex: i + 1,
            questionType: q.typeLabel || q.type,
            questionTitle: q.title,
            score: aiScore.totalScore || 0,
            scoreDetail: JSON.stringify(aiScore),
          });
        } catch (error) {
          console.error('AI评分失败:', error);
          // 失败时使用默认分数
          scoreResults.push({
            questionIndex: i + 1,
            questionType: q.typeLabel || q.type,
            questionTitle: q.title,
            score: 0,
            scoreDetail: JSON.stringify({ error: '评分失败' }),
          });
        }
      } else {
        // 无答案时记录0分
        scoreResults.push({
          questionIndex: i + 1,
          questionType: q.typeLabel || q.type,
          questionTitle: q.title,
          score: 0,
          scoreDetail: JSON.stringify({ note: '未作答' }),
        });
      }
    }

    totalScore = Object.values(dimensionScores).reduce((sum, s) => sum + s, 0);

    // 生成报告ID
    const reportId = Date.now().toString();

    // 返回完整报告
    return {
      reportId,
      sessionId,
      totalScore,
      scores: dimensionScores,
      scoreResults,
      date: new Date().toLocaleString(),
      feedback: {
        comprehensive: { points: ['请根据实际答案生成点评'] },
        organizational: { points: ['请根据实际答案生成点评'] },
        interpersonal: { points: ['请根据实际答案生成点评'] },
        emergency: { points: ['请根据实际答案生成点评'] },
      },
      optimization: [
        '请在小程序中使用录音功能进行完整评分',
        '或输入文字答案进行评分',
      ],
      references: questions.map((q, i) => ({
        questionIndex: i + 1,
        type: q.typeLabel || q.type,
        framework: '表态→分析→对策→总结',
        referenceAnswer: '这是一道高分答题示范...',
      })),
    };
  }

  /**
   * 获取模拟面试历史记录
   */
  async getSimulateRecords(limit: number = 20) {
    // 返回模拟数据（实际需要从数据库查询）
    return [
      {
        id: '1',
        date: new Date().toLocaleString(),
        totalScore: 76,
        scores: { comprehensive: 15, organizational: 16, interpersonal: 14, emergency: 15 },
        recordings: [],
        duration: 720,
      },
    ];
  }

  /**
   * 获取评分报告详情
   */
  async getReportById(id: number) {
    // 返回模拟报告数据
    return {
      id,
      date: new Date().toLocaleString(),
      totalScore: 76,
      scores: {
        comprehensive: 15,
        organizational: 16,
        interpersonal: 14,
        emergency: 15,
        expression: 8,
        appearance: 8,
      },
      feedback: {
        comprehensive: { points: ['观点基本明确', '逻辑框架清晰', '建议增加政策分析'] },
        organizational: { points: ['目标理解准确', '措施可行', '亮点：考虑全面'] },
        interpersonal: { points: ['换位思考意识好', '沟通恰当', '建议增强情感共鸣'] },
        emergency: { points: ['反应迅速', '思路清晰', '建议细化操作步骤'] },
      },
      optimization: ['加强政策解读深度', '增强同理心表达', '细化操作步骤'],
      references: [
        { questionIndex: 1, type: '综合分析', framework: '表态→分析→对策→总结', referenceAnswer: '高分示范...' },
      ],
    };
  }

  /**
   * 删除模拟面试记录
   */
  async deleteSimulateRecord(id: number) {
    // 实际需要从数据库删除
    return { success: true, message: '记录已删除' };
  }
}