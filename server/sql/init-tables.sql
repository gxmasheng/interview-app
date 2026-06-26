-- 上岸吧公考面试小程序数据库表创建脚本

-- 1. 题库表
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  difficulty INTEGER DEFAULT 3 NOT NULL,
  source VARCHAR(200),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS questions_type_idx ON questions(type);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON questions(difficulty);
CREATE INDEX IF NOT EXISTS questions_is_active_idx ON questions(is_active);

-- 2. 答题记录表
CREATE TABLE IF NOT EXISTS answer_records (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  answer_text TEXT NOT NULL,
  practice_mode VARCHAR(20) NOT NULL,
  thinking_time INTEGER,
  answer_time INTEGER,
  scores JSONB,
  total_score INTEGER,
  score_level VARCHAR(10),
  feedback TEXT,
  is_favorited BOOLEAN DEFAULT false NOT NULL,
  favorite_type VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS answer_records_question_id_idx ON answer_records(question_id);
CREATE INDEX IF NOT EXISTS answer_records_created_at_idx ON answer_records(created_at);

-- 3. 用户训练统计表
CREATE TABLE IF NOT EXISTS training_stats (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  single_count INTEGER DEFAULT 0 NOT NULL,
  simulation_count INTEGER DEFAULT 0 NOT NULL,
  avg_score INTEGER,
  type_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS training_stats_date_idx ON training_stats(date);

-- 4. 老师/点评专家表
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(500),
  introduction TEXT,
  expertise JSONB,
  is_online BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  pending_orders INTEGER DEFAULT 0 NOT NULL,
  completed_orders INTEGER DEFAULT 0 NOT NULL,
  avg_rating INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 5. 点评订单表
CREATE TABLE IF NOT EXISTS review_orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(50) NOT NULL,
  answer_record_id INTEGER REFERENCES answer_records(id),
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  question_content TEXT,
  question_type VARCHAR(20),
  user_note TEXT,
  teacher_id INTEGER REFERENCES teachers(id),
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  delivery_hours INTEGER DEFAULT 24 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  deadline_at TIMESTAMP WITH TIME ZONE,
  review_record_id INTEGER REFERENCES review_records(id),
  payment_status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
  card_type VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS review_orders_order_no_idx ON review_orders(order_no);
CREATE INDEX IF NOT EXISTS review_orders_status_idx ON review_orders(status);
CREATE INDEX IF NOT EXISTS review_orders_teacher_id_idx ON review_orders(teacher_id);
CREATE INDEX IF NOT EXISTS review_orders_created_at_idx ON review_orders(created_at);

-- 6. 点评记录表
CREATE TABLE IF NOT EXISTS review_records (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES review_orders(id),
  teacher_id INTEGER NOT NULL REFERENCES teachers(id),
  scores JSONB,
  total_score INTEGER,
  score_level VARCHAR(10),
  time_marks JSONB,
  text_feedback TEXT,
  audio_feedback_url VARCHAR(500),
  audio_duration INTEGER,
  highlights TEXT,
  improvements TEXT,
  answer_framework TEXT,
  reference_answer TEXT,
  user_rating INTEGER,
  user_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS review_records_order_id_idx ON review_records(order_id);
CREATE INDEX IF NOT EXISTS review_records_teacher_id_idx ON review_records(teacher_id);

-- 7. 会员订阅表
CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  member_type VARCHAR(20) NOT NULL,
  free_reviews INTEGER DEFAULT 0 NOT NULL,
  used_reviews INTEGER DEFAULT 0 NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  payment_channel VARCHAR(20),
  payment_amount INTEGER,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON memberships(user_id);
CREATE INDEX IF NOT EXISTS memberships_is_active_idx ON memberships(is_active);
CREATE INDEX IF NOT EXISTS memberships_end_at_idx ON memberships(end_at);

-- 8. 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  related_id INTEGER,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);

-- 9. 公告表
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'notice' NOT NULL,
  is_top BOOLEAN DEFAULT false NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS announcements_type_idx ON announcements(type);
CREATE INDEX IF NOT EXISTS announcements_is_top_idx ON announcements(is_top);
CREATE INDEX IF NOT EXISTS announcements_is_published_idx ON announcements(is_published);

-- 10. 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings(key);

-- 11. 备考指南内容表
CREATE TABLE IF NOT EXISTS guide_contents (
  id SERIAL PRIMARY KEY,
  section VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_member_only BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS guide_contents_section_idx ON guide_contents(section);
CREATE INDEX IF NOT EXISTS guide_contents_sort_order_idx ON guide_contents(sort_order);

-- 12. 访问码表
CREATE TABLE IF NOT EXISTS access_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  member_type VARCHAR(20) NOT NULL,
  duration_days INTEGER NOT NULL,
  free_reviews INTEGER DEFAULT 0 NOT NULL,
  is_used BOOLEAN DEFAULT false NOT NULL,
  used_by VARCHAR(100),
  used_at TIMESTAMP WITH TIME ZONE,
  batch_no VARCHAR(50),
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS access_codes_code_idx ON access_codes(code);
CREATE INDEX IF NOT EXISTS access_codes_is_used_idx ON access_codes(is_used);
CREATE INDEX IF NOT EXISTS access_codes_batch_no_idx ON access_codes(batch_no);

-- 插入示例数据

-- 示例题目
INSERT INTO questions (type, title, content, difficulty, source, is_active) VALUES
('comprehensive', '医保服务便民措施', '近日，国家医保局推出16项医保服务便民措施，提出推进医保服务"网上办"，变"群众跑腿"为"数据跑腿"等，并要求确保今年8月底前取得新突破、新成效。对此，你怎么看？', 3, '2023年真题', true),
('organizational', '收集患者建议', '作为小组长，你需要完成一项收集患者对于医疗服务质量所提建议的工作，为获得最真实有效的信息，你会如何落实执行这项工作？', 3, '2023年真题', true),
('interpersonal', '朋友请求加塞', '你的好朋友找到你，表示第二天将到你单位看病，希望届时你能安排加塞，让他免于排队。对此，你会如何与其进行沟通？', 3, '2023年真题', true),
('emergency', '健康讲座分工不满', '单位计划面向广大群众开展一场健康讲座，你作为此次活动的负责人，安排了分工后，有人认为重活累活都集中在几个人头上，对你的分工表示不满。对此，你会如何促进团队合作？', 3, '2023年真题', true),
('comprehensive', '乡村振兴人才引进', '某地为了推进乡村振兴，出台了一系列人才引进政策，包括购房补贴、创业扶持等。但实施一年后，引进人才流失率较高。请分析原因并提出对策。', 4, '2022年真题', true),
('organizational', '社区老年活动中心', '你所在社区要建设一个老年活动中心，需要调研老年人需求。请设计一个调研方案。', 3, '2022年真题', true),
('interpersonal', '同事工作态度消极', '你的同事最近工作态度消极，经常迟到早退，影响了团队工作进度。作为团队负责人，你会如何处理？', 3, '2022年真题', true),
('emergency', '突发火灾处理', '你正在主持一个重要会议，突然接到通知说办公楼发生火灾。你会如何应对？', 4, '2022年真题', true),
('comprehensive', '互联网监管', '近年来，互联网平台垄断、数据安全等问题频发。请谈谈你对互联网行业监管的看法。', 4, '2021年真题', true),
('organizational', '扶贫项目验收', '你负责的扶贫项目即将验收，但部分项目还存在质量问题。你会如何确保验收顺利通过？', 3, '2021年真题', true);

-- 示例公告
INSERT INTO announcements (title, content, type, is_top, is_published, published_at) VALUES
('系统上线公告', '上岸吧公考面试小程序正式上线！欢迎使用AI智能评分系统进行面试训练。', 'notice', true, true, NOW()),
('会员优惠活动', '新用户首月会员享8折优惠，回复"会员"获取访问码。', 'promotion', false, true, NOW());

-- 示例备考指南内容
INSERT INTO guide_contents (section, title, content, sort_order, is_member_only) VALUES
('process', '面试流程概述', '公务员结构化面试一般包括：报到抽签、候考、进入考场、答题、退场等环节。全场面试时间约15-20分钟，包含4道题目...', 1, false),
('standard', '评分标准详解', '总分100分，细分为6个维度：综合分析(20分)、组织协调(20分)、人际沟通(20分)、应急应变(20分)、语言表达(10分)、仪表仪态(10分)...', 2, false),
('technique', '高分答题技巧', '1.观点明确：答题开头要旗帜鲜明地表态\n2.逻辑清晰：按照"是什么-为什么-怎么办"的框架展开\n3.内容充实：结合实际，有理有据...', 3, true),
('notice', '考场注意事项', '1.着装得体：建议穿正装，保持整洁\n2.礼仪规范：进门前敲门，向考官鞠躬致意\n3.时间把控：审题3分钟，每题答题不超过3分钟...', 4, true),
('material', '素材积累', '常见话题素材：民生保障、经济发展、社会治理、生态环保、文化建设...', 5, true),
('case', '案例库', '历年高分答题案例分析与参考思路...', 6, true);

-- 示例老师
INSERT INTO teachers (name, avatar, introduction, expertise, is_online, is_active) VALUES
('张老师', null, '10年公考面试培训经验，曾担任多家培训机构首席讲师', '["综合分析", "组织协调"]', true, true),
('李老师', null, '8年面试指导经验，擅长人际沟通和应急应变题型', '["人际沟通", "应急应变"]', true, true);