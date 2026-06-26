import { Injectable } from '@nestjs/common'
import { S3Storage } from 'coze-coding-dev-sdk'

@Injectable()
export class UploadService {
  private storage: S3Storage

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    })
  }

  async uploadFromUrl(url: string): Promise<{ key: string; url: string }> {
    // 从 URL 下载并上传到 TOS
    const key = await this.storage.uploadFromUrl({ url, timeout: 30000 })
    
    // 生成可访问的签名 URL（有效期30天）
    const signedUrl = await this.storage.generatePresignedUrl({
      key,
      expireTime: 2592000, // 30天
    })
    
    return { key, url: signedUrl }
  }
}