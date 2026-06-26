# Railway免费托管部署指南

## 一、准备工作

1. 注册GitHub账号（如没有）
2. 将项目代码推送到GitHub仓库
3. 注册Railway账号：https://railway.app（可用GitHub登录）

---

## 二、部署步骤

### 步骤1：创建Railway项目

1. 登录 Railway：https://railway.app
2. 点击「New Project」
3. 选择「Deploy from GitHub repo」
4. 选择您的项目仓库

### 步骤2：添加PostgreSQL数据库

1. 在项目中点击「Add Service」
2. 选择「Database」→「PostgreSQL」
3. 自动创建数据库连接

### 步骤3：配置环境变量

在Backend服务中添加环境变量：

| 变量名 | 值 |
|--------|------|
| `COZE_SUPABASE_URL` | Railway自动生成的PostgreSQL连接URL |
| `COZE_SUPABASE_ANON_KEY` | Railway生成的数据库密钥 |
| `COZE_LLM_API_KEY` | 您的LLM API密钥 |
| `PROJECT_DOMAIN` | Railway生成的前端域名 |

### 步骤4：配置构建命令

**前端服务**：
- Build Command: `pnpm build:web`
- Output Directory: `dist-web`

**后端服务**：
- Build Command: `pnpm build:server`
- Start Command: `node server/dist/main.js`

---

## 三、配置自定义域名（可选）

1. 在Railway项目设置中添加自定义域名
2. 按提示配置DNS记录
3. Railway自动配置HTTPS

---

## 四、免费额度说明

Railway每月提供：
- $5免费额度
- 约500小时运行时间
- 适合个人项目和小流量应用

超出额度后：
- 每GB存储 $0.25/月
- 每GB流量 $0.10
- 按量付费，无最低消费

---

## 五、部署清单

部署前确认：
- [ ] GitHub仓库已推送代码
- [ ] Railway账号已注册
- [ ] PostgreSQL数据库已创建
- [ ] 环境变量已配置
- [ ] 构建命令已设置

---

## 替代方案：Render

如果Railway额度不足，可使用Render：

1. 注册：https://render.com
2. 创建Web Service（后端）
3. 创建Static Site（前端）
4. 添加免费PostgreSQL数据库

**注意**：Render免费服务有15分钟休眠，首次访问需等待唤醒。