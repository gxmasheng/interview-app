import { pgTable, serial, timestamp, varchar, text, integer, boolean, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统健康检查表（必须保留）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 题库表
export const questions = pgTable(
  "questions",
  {
    id: serial().primaryKey(),
    // 题型：comprehensive（综合分析）、organizational（组织协调）、interpersonal（人际沟通）、emergency（应急应变）
    type: varchar("type", { length: 20 }).notNull(),
    // 题目标题
    title: varchar("title", { length: 500 }).notNull(),
    // 题目详细内容/要求
    content: text("content").notNull(),
    // 难度等级：1-5
    difficulty: integer("difficulty").default(3).notNull(),
    // 题目来源/出处
    source: varchar("source", { length: 200 }),
    // 是否启用
    is_active: boolean("is_active").default(true).notNull(),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("questions_type_idx").on(table.type),
    index("questions_difficulty_idx").on(table.difficulty),
    index("questions_is_active_idx").on(table.is_active),
  ]
);

// 答题记录表
export const answerRecords = pgTable(
  "answer_records",
  {
    id: serial().primaryKey(),
    // 关联题目
    question_id: integer("question_id").notNull().references(() => questions.id),
    // 用户答案文本
    answer_text: text("answer_text").notNull(),
    // 练习模式：single（单题练习）、simulation（全真模拟）
    practice_mode: varchar("practice_mode", { length: 20 }).notNull(),
    // 审题用时（秒）
    thinking_time: integer("thinking_time"),
    // 答题用时（秒）
    answer_time: integer("answer_time"),
    // AI评分详情（JSON格式存储六维度评分）
    // 结构: { comprehensive: { score: 16, level: '好' }, organizational: { score: 15, level: '中' }, ... }
    scores: jsonb("scores"),
    // 总分
    total_score: integer("total_score"),
    // 评分档位：good（好）、medium（中）、poor（差）
    score_level: varchar("score_level", { length: 10 }),
    // AI点评内容
    feedback: text("feedback"),
    // 是否收藏
    is_favorited: boolean("is_favorited").default(false).notNull(),
    // 收藏类型：error（错题）、good（好题）
    favorite_type: varchar("favorite_type", { length: 10 }),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("answer_records_question_id_idx").on(table.question_id),
    index("answer_records_created_at_idx").on(table.created_at),
    index("answer_records_is_favorited_idx").on(table.is_favorited),
  ]
);

// 用户训练统计表（汇总数据）
export const trainingStats = pgTable(
  "training_stats",
  {
    id: serial().primaryKey(),
    // 日期（用于每日统计）
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    // 单题练习次数
    single_count: integer("single_count").default(0).notNull(),
    // 全真模拟次数
    simulation_count: integer("simulation_count").default(0).notNull(),
    // 平均得分
    avg_score: integer("avg_score"),
    // 各题型得分汇总
    // 结构: { comprehensive: { avg: 16, count: 10 }, organizational: { avg: 15, count: 8 }, ... }
    type_scores: jsonb("type_scores"),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("training_stats_date_idx").on(table.date),
  ]
);

// 老师/点评专家表
export const teachers = pgTable(
  "teachers",
  {
    id: serial().primaryKey(),
    // 老师姓名
    name: varchar("name", { length: 50 }).notNull(),
    // 老师头像
    avatar: varchar("avatar", { length: 500 }),
    // 简介
    introduction: text("introduction"),
    // 专业领域标签（JSON数组）
    // 结构: ["综合分析", "组织协调"]
    expertise: jsonb("expertise"),
    // 是否在线接单
    is_online: boolean("is_online").default(false).notNull(),
    // 是否启用
    is_active: boolean("is_active").default(true).notNull(),
    // 当前待处理订单数
    pending_orders: integer("pending_orders").default(0).notNull(),
    // 已完成订单数
    completed_orders: integer("completed_orders").default(0).notNull(),
    // 平均评分（用户对老师的评分）
    avg_rating: integer("avg_rating").default(5),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("teachers_is_online_idx").on(table.is_online),
    index("teachers_is_active_idx").on(table.is_active),
  ]
);

// 点评订单表
export const reviewOrders = pgTable(
  "review_orders",
  {
    id: serial().primaryKey(),
    // 订单编号
    order_no: varchar("order_no", { length: 50 }).notNull(),
    // 关联答题记录（可选，如果是基于已有答题）
    answer_record_id: integer("answer_record_id").references(() => answerRecords.id),
    // 答题视频/音频URL
    media_url: varchar("media_url", { length: 500 }).notNull(),
    // 媒体类型：video（视频）、audio（音频）
    media_type: varchar("media_type", { length: 10 }).notNull(),
    // 题目内容（如果是上传新答题）
    question_content: text("question_content"),
    // 题型
    question_type: varchar("question_type", { length: 20 }),
    // 用户备注
    user_note: text("user_note"),
    // 分配的老师
    teacher_id: integer("teacher_id").references(() => teachers.id),
    // 订单状态：pending（待接单）、accepted（已接单）、reviewing（点评中）、completed（已完成）、timeout（超时转派）、cancelled（已取消）
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    // 交付时效（小时）：12、24、48
    delivery_hours: integer("delivery_hours").default(24).notNull(),
    // 订单创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 老师接单时间
    accepted_at: timestamp("accepted_at", { withTimezone: true }),
    // 点评完成时间
    completed_at: timestamp("completed_at", { withTimezone: true }),
    // 超时时间（预计）
    deadline_at: timestamp("deadline_at", { withTimezone: true }),
    // 关联点评记录
    review_record_id: integer("review_record_id").references(() => reviewRecords.id),
    // 支付状态：free（免费赠送）、paid（已付费）、unpaid（未付费）
    payment_status: varchar("payment_status", { length: 20 }).default("unpaid").notNull(),
    // 会员卡类型：monthly（月卡）、quarterly（季卡）、yearly（年卡）、single（单次）
    card_type: varchar("card_type", { length: 20 }),
  },
  (table) => [
    index("review_orders_order_no_idx").on(table.order_no),
    index("review_orders_status_idx").on(table.status),
    index("review_orders_teacher_id_idx").on(table.teacher_id),
    index("review_orders_created_at_idx").on(table.created_at),
    index("review_orders_deadline_at_idx").on(table.deadline_at),
  ]
);

// 点评记录表（老师的点评内容）
export const reviewRecords = pgTable(
  "review_records",
  {
    id: serial().primaryKey(),
    // 关联订单
    order_id: integer("order_id").notNull().references(() => reviewOrders.id),
    // 老师ID
    teacher_id: integer("teacher_id").notNull().references(() => teachers.id),
    // 六维度评分
    // 结构: { comprehensive: { score: 16, level: '好', comment: '...' }, ... }
    scores: jsonb("scores"),
    // 总分
    total_score: integer("total_score"),
    // 评分档位
    score_level: varchar("score_level", { length: 10 }),
    // 时间点标记（JSON数组）
    // 结构: [{ time: "02:15", mark: "逻辑混乱", suggestion: "建议..." }]
    time_marks: jsonb("time_marks"),
    // 文字点评
    text_feedback: text("text_feedback"),
    // 语音点评URL
    audio_feedback_url: varchar("audio_feedback_url", { length: 500 }),
    // 语音点评时长（秒）
    audio_duration: integer("audio_duration"),
    // 亮点总结
    highlights: text("highlights"),
    // 改进建议
    improvements: text("improvements"),
    // 高分答题框架
    answer_framework: text("answer_framework"),
    // 参考思路
    reference_answer: text("reference_answer"),
    // 用户评分（对老师的评分，1-5星）
    user_rating: integer("user_rating"),
    // 用户评价
    user_comment: text("user_comment"),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("review_records_order_id_idx").on(table.order_id),
    index("review_records_teacher_id_idx").on(table.teacher_id),
  ]
);

// 会员订阅表
export const memberships = pgTable(
  "memberships",
  {
    id: serial().primaryKey(),
    // 用户标识（设备ID或临时用户ID）
    user_id: varchar("user_id", { length: 100 }).notNull(),
    // 会员类型：monthly（月卡）、quarterly（季卡）、yearly（年卡）
    member_type: varchar("member_type", { length: 20 }).notNull(),
    // 赠送的人工点评次数
    free_reviews: integer("free_reviews").default(0).notNull(),
    // 已使用的人工点评次数
    used_reviews: integer("used_reviews").default(0).notNull(),
    // 开始时间
    start_at: timestamp("start_at", { withTimezone: true }).defaultNow().notNull(),
    // 结束时间
    end_at: timestamp("end_at", { withTimezone: true }).notNull(),
    // 是否有效
    is_active: boolean("is_active").default(true).notNull(),
    // 支付渠道：wechat（微信）、alipay（支付宝）、other（其他）
    payment_channel: varchar("payment_channel", { length: 20 }),
    // 支付金额（元）
    payment_amount: integer("payment_amount"),
    // 支付时间
    paid_at: timestamp("paid_at", { withTimezone: true }),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("memberships_user_id_idx").on(table.user_id),
    index("memberships_is_active_idx").on(table.is_active),
    index("memberships_end_at_idx").on(table.end_at),
  ]
);

// 通知表
export const notifications = pgTable(
  "notifications",
  {
    id: serial().primaryKey(),
    // 用户标识
    user_id: varchar("user_id", { length: 100 }).notNull(),
    // 通知类型：review_completed（点评完成）、order_timeout（订单超时）、membership_expire（会员到期）
    type: varchar("type", { length: 30 }).notNull(),
    // 通知标题
    title: varchar("title", { length: 100 }).notNull(),
    // 通知内容
    content: text("content").notNull(),
    // 关联数据ID（如订单ID）
    related_id: integer("related_id"),
    // 是否已读
    is_read: boolean("is_read").default(false).notNull(),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.user_id),
    index("notifications_is_read_idx").on(table.is_read),
    index("notifications_created_at_idx").on(table.created_at),
  ]
);

// 公告表
export const announcements = pgTable(
  "announcements",
  {
    id: serial().primaryKey(),
    // 公告标题
    title: varchar("title", { length: 200 }).notNull(),
    // 公告内容
    content: text("content").notNull(),
    // 公告类型：notice（通知）、update（更新）、promotion（活动）
    type: varchar("type", { length: 20 }).default("notice").notNull(),
    // 是否置顶
    is_top: boolean("is_top").default(false).notNull(),
    // 是否发布
    is_published: boolean("is_published").default(false).notNull(),
    // 发布时间
    published_at: timestamp("published_at", { withTimezone: true }),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("announcements_type_idx").on(table.type),
    index("announcements_is_top_idx").on(table.is_top),
    index("announcements_is_published_idx").on(table.is_published),
  ]
);

// 系统设置表
export const systemSettings = pgTable(
  "system_settings",
  {
    id: serial().primaryKey(),
    // 设置键名
    key: varchar("key", { length: 100 }).notNull(),
    // 设置值（JSON格式）
    value: jsonb("value").notNull(),
    // 设置描述
    description: text("description"),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("system_settings_key_idx").on(table.key),
  ]
);

// 备考指南内容表
export const guideContents = pgTable(
  "guide_contents",
  {
    id: serial().primaryKey(),
    // 版块标识：process（流程）、standard（评分标准）、technique（技巧）、notice（注意事项）、material（素材）、case（案例库）
    section: varchar("section", { length: 30 }).notNull(),
    // 内容标题
    title: varchar("title", { length: 200 }).notNull(),
    // 内容正文
    content: text("content").notNull(),
    // 排序序号
    sort_order: integer("sort_order").default(0).notNull(),
    // 是否会员专享
    is_member_only: boolean("is_member_only").default(false).notNull(),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 更新时间
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("guide_contents_section_idx").on(table.section),
    index("guide_contents_sort_order_idx").on(table.sort_order),
  ]
);

// 访问码表（替代微信支付方案）
export const accessCodes = pgTable(
  "access_codes",
  {
    id: serial().primaryKey(),
    // 访问码（8位字母数字组合）
    code: varchar("code", { length: 20 }).notNull().unique(),
    // 会员类型：monthly（月卡）、quarterly（季卡）、yearly（年卡）、single_review（单次点评）
    member_type: varchar("member_type", { length: 20 }).notNull(),
    // 对应时长（天数）
    duration_days: integer("duration_days").notNull(),
    // 赠送的人工点评次数
    free_reviews: integer("free_reviews").default(0).notNull(),
    // 是否已使用
    is_used: boolean("is_used").default(false).notNull(),
    // 使用者用户ID
    used_by: varchar("used_by", { length: 100 }),
    // 使用时间
    used_at: timestamp("used_at", { withTimezone: true }),
    // 批次号（用于批量生成）
    batch_no: varchar("batch_no", { length: 50 }),
    // 备注
    remark: text("remark"),
    // 创建时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 过期时间（访问码本身的有效期）
    expires_at: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("access_codes_code_idx").on(table.code),
    index("access_codes_is_used_idx").on(table.is_used),
    index("access_codes_batch_no_idx").on(table.batch_no),
  ]
);