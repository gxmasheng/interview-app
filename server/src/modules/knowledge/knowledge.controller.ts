import { Controller, Post, Body } from '@nestjs/common'
import { KnowledgeService } from './knowledge.service'

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('search')
  async search(@Body() body: { query: string; topK?: number }) {
    return this.knowledgeService.search(body.query, body.topK || 5)
  }
}