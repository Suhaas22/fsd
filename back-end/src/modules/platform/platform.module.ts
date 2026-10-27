import {APP_INTERCEPTOR} from '@nestjs/core';
import {OperationsService} from './operations.service';
import {OperationsInterceptor} from './operations.interceptor';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PlatformService } from './platform.service';
import { AdminController, AdminAccountGuard, PublicController } from './platform.controller';
@Module({ imports: [UsersModule, AuthModule], controllers: [AdminController, PublicController, WorkspaceController], providers: [OperationsService,{provide:APP_INTERCEPTOR,useClass:OperationsInterceptor},PlatformService, AdminAccountGuard, WorkspaceService] })
export class PlatformModule {
}
