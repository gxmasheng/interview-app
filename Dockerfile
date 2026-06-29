FROM node:20-alpine

WORKDIR /app

# 使用corepack安装pnpm（更快，不需要npm install）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制package文件
COPY package.json pnpm-lock.yaml* ./
COPY server/package.json ./server/

# 安装生产依赖（使用缓存加速）
RUN pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod

# 复制构建产物
COPY server/dist ./server/dist/

# 设置环境变量
ENV NODE_ENV=production

# 启动服务
CMD ["node", "server/dist/main.js"]