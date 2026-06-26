/**
 * 应用配置文件
 * 请修改以下配置为你的实际信息
 */

export const APP_CONFIG = {
  // ===== 会员获取方式配置 =====
  // 通过微信公众号获取访问码
  // 流程：关注公众号 → 回复关键词"会员" → 获取访问码 → 在小程序激活

  // 公众号名称（用户搜索关注）
  WECHAT_PUBLIC_NAME: '上岸公考面试',

  // 获取会员关键词
  MEMBER_KEYWORD: '会员',

  // 会员获取指引文案
  MEMBER_GUIDE_TEXT: '关注公众号【上岸公考面试】，回复"会员"获取访问码',

  // 公众号二维码图片URL（上传到TOS后替换）
  WECHAT_QRCODE_URL: '',

  // ===== 客服配置 =====
  // 客服微信号
  SERVICE_WECHAT: 'gxmasheng',

  // 客服二维码URL
  SERVICE_QRCODE_URL: '',

  // ===== 品牌配置 =====
  // 应用名称
  APP_NAME: '上岸吧公考面试',

  // 品牌标语
  APP_SLOGAN: 'AI智能训练 + 专业人工点评，助你成功上岸',

  // ===== 会员价格配置 =====
  MEMBER_PRICES: {
    monthly: {
      price: 29.9,
      name: '月卡',
      days: 30,
      reviewCount: 1,
    },
    quarterly: {
      price: 59.9,
      name: '季卡',
      days: 90,
      reviewCount: 2,
    },
    yearly: {
      price: 199.9,
      name: '年卡',
      days: 365,
      reviewCount: 6,
    },
    singleReview: {
      price: 39,
      name: '单次点评',
      days: 0,
      reviewCount: 1,
    },
  },

  // ===== 联系方式 =====
  // 客服邮箱
  SERVICE_EMAIL: 'service@example.com',

  // 客服电话（可选）
  SERVICE_PHONE: '',

  // ===== 社交媒体 =====
  // 小红书账号
  XIAOHONGSHU_ID: '',

  // 知乎账号
  ZHIHU_ID: '',
}

// 导出类型
export type AppConfig = typeof APP_CONFIG