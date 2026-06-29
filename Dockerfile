# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm --registry=https://registry.npmmirror.com

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
COPY server/package.json ./server/

# 安装依赖
RUN pnpm install --prod --frozen-lockfile --registry=https://registry.npmmirror.com || pnpm install --prod

# 复制构建产物
COPY server/dist ./server/dist

# 运行阶段 - 只保留必要文件
FROM node:20-alpine

WORKDIR /app

# 复制构建阶段的产物
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/node_modules ./node_modules

# 设置环境变量
ENV NODE_ENV=production

# 启动服务
CMD ["node", "server/dist/main.js"]