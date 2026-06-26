import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 题目类型映射
const TYPE_MAP = {
  comprehensive: '综合分析',
  organizational: '组织协调',
  interpersonal: '人际沟通',
  emergency: '应急应变',
};

// 种子题目数据
const SEED_QUESTIONS = [
  {
    type: 'comprehensive',
    title: '当前社会上存在「躺平」现象，有人认为这是一种消极逃避，也有人认为这是年轻人的自我保护。请谈谈你的看法。',
    content: '当前社会上存在「躺平」现象，有人认为这是一种消极逃避，也有人认为这是年轻人的自我保护。请谈谈你的看法。',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    type: 'comprehensive',
    title: '近年来，「网红经济」快速发展，带来了巨大的经济效益，但也引发了一些问题。请分析「网红经济」的利弊并提出对策。',
    content: '近年来，「网红经济」快速发展，带来了巨大的经济效益，但也引发了一些问题。请分析「网红经济」的利弊并提出对策。',
    difficulty: 4,
    source: '2024年国考真题',
  },
  {
    type: 'organizational',
    title: '你是新入职的公务员，领导安排你组织一次单位内部的学习交流活动，你会如何组织？',
    content: '你是新入职的公务员，领导安排你组织一次单位内部的学习交流活动，你会如何组织？请详细说明你的组织方案。',
    difficulty: 2,
    source: '2023年市考真题',
  },
  {
    type: 'interpersonal',
    title: '你和同事在处理一项工作任务时产生了分歧，同事认为你的方案不合理，你会如何处理？',
    content: '你和同事在处理一项工作任务时产生了分歧，同事认为你的方案不合理，你会如何处理？请说明你的处理方式。',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    type: 'emergency',
    title: '你是某单位窗口服务人员，一位群众因为材料不全无法办理业务，情绪激动并在现场大声抱怨，你会如何处理？',
    content: '你是某单位窗口服务人员，一位群众因为材料不全无法办理业务，情绪激动并在现场大声抱怨，你会如何处理？',
    difficulty: 4,
    source: '2024年国考真题',
  },
  {
    type: 'comprehensive',
    title: '有人认为「短视频」改变了人们的学习方式，让知识传播更便捷；也有人认为它导致人们思维碎片化。请谈谈你的看法。',
    content: '有人认为「短视频」改变了人们的学习方式，让知识传播更便捷；也有人认为它导致人们思维碎片化。请谈谈你的看法。',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    type: 'organizational',
    title: '单位准备开展一次垃圾分类宣传活动，领导安排你负责，你会如何策划？',
    content: '单位准备开展一次垃圾分类宣传活动，领导安排你负责，你会如何策划？请详细说明活动方案。',
    difficulty: 2,
    source: '2023年市考真题',
  },
  {
    type: 'interpersonal',
    title: '你在工作中发现领导的一个决定可能存在问题，你会如何沟通？',
    content: '你在工作中发现领导的一个决定可能存在问题，你会如何与领导沟通？请说明你的处理方式。',
    difficulty: 4,
    source: '2024年国考真题',
  },
  {
    type: 'emergency',
    title: '某活动现场突发设备故障，导致活动无法正常进行，现场观众开始抱怨，作为负责人你会如何处理？',
    content: '某活动现场突发设备故障，导致活动无法正常进行，现场观众开始抱怨，作为负责人你会如何处理？',
    difficulty: 3,
    source: '2024年省考真题',
  },
  {
    type: 'comprehensive',
    title: '「人工智能」技术快速发展，有人认为它将取代很多工作岗位，也有人认为它会创造新的就业机会。请谈谈你的看法。',
    content: '「人工智能」技术快速发展，有人认为它将取代很多工作岗位，也有人认为它会创造新的就业机会。请谈谈你的看法。',
    difficulty: 4,
    source: '2024年国考真题',
  },
];

@Injectable()
export class QuestionsService {
  /**
   * 获取所有题目列表
   */
  async getQuestions(type?: string, limit: number = 50) {
    const client = getSupabaseClient();

    let query = client
      .from('questions')
      .select('id, type, title, content, difficulty, source, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // 按类型筛选
    if (type && ['comprehensive', 'organizational', 'interpersonal', 'emergency'].includes(type)) {
      query = query.eq('type', type);
    }

    // 限制数量
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`获取题目列表失败: ${error.message}`);
    }

    // 格式化返回数据
    return data.map(q => ({
      ...q,
      typeLabel: TYPE_MAP[q.type as keyof typeof TYPE_MAP] || q.type,
      difficultyLabel: this.getDifficultyLabel(q.difficulty),
    }));
  }

  /**
   * 获取单个题目详情
   */
  async getQuestionById(id: number) {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('questions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`获取题目详情失败: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      typeLabel: TYPE_MAP[data.type as keyof typeof TYPE_MAP] || data.type,
      difficultyLabel: this.getDifficultyLabel(data.difficulty),
    };
  }

  /**
   * 获取推荐题目
   */
  async getRecommendedQuestions(count: number = 3) {
    // 随机获取几道题目作为推荐
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('questions')
      .select('id, type, title, content, difficulty, source')
      .eq('is_active', true)
      .limit(count);

    if (error) {
      throw new Error(`获取推荐题目失败: ${error.message}`);
    }

    return data.map(q => ({
      ...q,
      typeLabel: TYPE_MAP[q.type as keyof typeof TYPE_MAP] || q.type,
      difficultyLabel: this.getDifficultyLabel(q.difficulty),
    }));
  }

  /**
   * 初始化种子数据
   */
  async seedQuestions() {
    const client = getSupabaseClient();

    // 先检查是否已有数据
    const { data: existing } = await client
      .from('questions')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      return { message: '题库已有数据，跳过初始化', count: existing.length };
    }

    // 插入种子数据
    const { data, error } = await client
      .from('questions')
      .insert(SEED_QUESTIONS)
      .select();

    if (error) {
      throw new Error(`初始化题库失败: ${error.message}`);
    }

    return { message: '题库初始化成功', count: data.length };
  }

  /**
   * 获取模拟面试题目（随机抽取4道不同题型）
   */
  async getSimulateQuestions(types: string[]) {
    const client = getSupabaseClient();
    const questions: any[] = [];

    // 按题型顺序抽取题目
    for (const type of types) {
      const { data, error } = await client
        .from('questions')
        .select('id, type, title, content, difficulty, source')
        .eq('is_active', true)
        .eq('type', type)
        .limit(1);

      if (!error && data && data.length > 0) {
        questions.push({
          ...data[0],
          typeLabel: TYPE_MAP[data[0].type as keyof typeof TYPE_MAP] || data[0].type,
          difficultyLabel: this.getDifficultyLabel(data[0].difficulty),
        });
      }
    }

    return { questions };
  }

  /**
   * 获取难度标签
   */
  private getDifficultyLabel(difficulty: number): string {
    if (difficulty <= 2) return '较易';
    if (difficulty === 3) return '中等';
    return '较难';
  }

  /**
   * 批量添加题目
   */
  async batchAddQuestions(questions: Array<{ title: string; type: string; difficulty?: string }>) {
    const client = getSupabaseClient();

    // 转换难度值
    const questionsToInsert = questions.map(q => ({
      type: q.type,
      title: q.title,
      content: q.title,
      difficulty: this.parseDifficulty(q.difficulty),
      source: '手动添加',
      is_active: true,
    }));

    const { data, error } = await client
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
      throw new Error(`批量添加题目失败: ${error.message}`);
    }

    return { message: '批量添加成功', count: data.length };
  }

  /**
   * 解析难度值
   */
  private parseDifficulty(difficulty?: string): number {
    if (!difficulty) return 3;
    if (difficulty === 'easy') return 2;
    if (difficulty === 'hard') return 4;
    return 3;
  }
}