import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ProjectsController, OpportunitiesController],
  providers: [ProjectsService, OpportunitiesService],
  exports: [ProjectsService, OpportunitiesService],
})
export class ProjectsModule {}