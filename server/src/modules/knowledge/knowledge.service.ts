import { Injectable } from '@nestjs/common'
import { KnowledgeClient, Config } from 'coze-coding-dev-sdk'

@Injectable()
export class KnowledgeService {
  private client: KnowledgeClient

  constructor() {
    const config = new Config()
    this.client = new KnowledgeClient(config)
  }

  async search(query: string, topK: number = 5) {
    try {
      const response = await this.client.search(query, undefined, topK, 0.5)
      
      return {
        code: 0,
        msg: 'success',
        data: {
          chunks: response.chunks || [],
          total: response.chunks?.length || 0
        }
      }
    } catch (error: any) {
      console.error('Knowledge search error:', error)
      return {
        code: -1,
        msg: error.message || '知识库搜索失败',
        data: null
      }
    }
  }
}