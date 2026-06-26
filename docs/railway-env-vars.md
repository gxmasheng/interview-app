# Railway环境变量配置清单

## 必须配置的环境变量

在Railway项目设置中添加以下环境变量：

### 数据库变量（从Railway PostgreSQL服务自动注入）
Railway会自动注入以下变量，无需手动配置：
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

### Supabase变量（必须手动配置）
从Supabase控制台获取：
- `COZE_SUPABASE_URL`：Supabase项目URL
- `COZE_SUPABASE_ANON_KEY`：Supabase匿名密钥

### LLM API变量（必须手动配置）
- `COZE_BOT_TOKEN`：Bot Token
- `COZE_API_BASE`：API地址

### 应用变量（必须手动配置）
- `NODE_ENV`：production
- `PORT`：3000（Railway自动分配，无需配置）

## 配置步骤

1. 在Supabase控制台获取URL和密钥：
   - 登录 https://supabase.com/dashboard
   - 选择项目 → Settings → API
   - 复制 Project URL 和 anon public key

2. 在Railway中添加变量：
   - 进入项目 → Variables 标签
   - 点击 "Add Variable"
   - 输入变量名和值

## 变量格式示例

```
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJxxx...
COZE_BOT_TOKEN=xxx
COZE_API_BASE=https://api.coze.cn
NODE_ENV=production
```

## 注意事项

- 环境变量值不要包含引号
- URL必须是完整地址（包含https://）
- 密钥必须是完整的字符串