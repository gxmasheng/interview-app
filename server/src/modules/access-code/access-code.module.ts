import { Module } from '@nestjs/common'
import { AccessCodeController } from './access-code.controller'
import { AccessCodeService } from './access-code.service'

@Module({
  controllers: [AccessCodeController],
  providers: [AccessCodeService],
})
export class AccessCodeModule {}