import { Module, forwardRef } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CommonModule } from '../common/common.module';
import { TrustModule } from '../trust/trust.module';

@Module({
  imports: [CommonModule, forwardRef(() => TrustModule)],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}