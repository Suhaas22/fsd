import { Module } from '@nestjs/common';
import { InstructorRequestsController } from './instructor-requests.controller';
import { InstructorRequestsService } from './instructor-requests.service';

@Module({
  controllers: [InstructorRequestsController],
  providers: [InstructorRequestsService],
  exports: [InstructorRequestsService],
})
export class InstructorRequestsModule {}
