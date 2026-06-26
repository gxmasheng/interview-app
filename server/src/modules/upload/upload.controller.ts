import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('from-url')
  @HttpCode(HttpStatus.OK)
  async uploadFromUrl(@Body() body: { url: string }) {
    console.log('[UploadController] uploadFromUrl called, url:', body.url)
    const result = await this.uploadService.uploadFromUrl(body.url)
    console.log('[UploadController] upload result:', result)
    return {
      code: 200,
      msg: '上传成功',
      data: result,
    }
  }
}