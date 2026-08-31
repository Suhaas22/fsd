import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationsController } from './organizations.controller';
import { OrganizationService } from './organization.service';

@Module({
  controllers: [OrganizationController, OrganizationsController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
