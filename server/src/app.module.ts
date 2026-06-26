import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { QuestionsModule } from '@/modules/questions/questions.module';
import { InterviewModule } from '@/modules/interview/interview.module';
import { UploadModule } from '@/modules/upload/upload.module';
import { ReviewModule } from '@/modules/review/review.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { AccessCodeModule } from '@/modules/access-code/access-code.module';
import { KnowledgeModule } from '@/modules/knowledge/knowledge.module';
import { GuideModule } from '@/modules/guide/guide.module';

@Module({
  imports: [QuestionsModule, InterviewModule, UploadModule, ReviewModule, AdminModule, AuthModule, PaymentModule, AccessCodeModule, KnowledgeModule, GuideModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}