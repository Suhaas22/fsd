import { Delete, Body, CanActivate, Controller, ExecutionContext, Get, Injectable, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { AdminQuery, CourseDecision, AdminProfile, CourseEdit } from './platform.dto';
@Injectable()
export class AdminAccountGuard implements CanActivate {
    constructor(private readonly platform: PlatformService) { }
    async canActivate(context: ExecutionContext) { const req = context.switchToHttp().getRequest(); req.admin = await this.platform.account(req.headers); return true; }
}
@Controller('admin')
@UseGuards(AdminAccountGuard)
export class AdminController {
    constructor(private readonly platform: PlatformService) { }
    @Get('session')
    session(
    @Req()
    req: any) { return this.platform.session(req.admin); }
    @Patch('profile')
    profile(
    @Req()
    req: any, 
    @Body()
    dto: AdminProfile) { return this.platform.updateProfile(req.admin, dto); }
    @Get('overview')
    overview() { return this.platform.overview(); }
    @Get('courses')
    courses(
    @Query()
    query: AdminQuery) { return this.platform.courses(query); }
    @Get('course-queue') courseQueue(@Query('search') search:string){return this.platform.courseQueue(search);}
    @Get('courses/:id')
    course(
    @Param('id')
    id: string) { return this.platform.course(id); }
    @Post('courses/:id/review')
    review(
    @Param('id')
    id: string, 
    @Body()
    dto: CourseDecision, 
    @Req()
    req: any) { return this.platform.review(id, dto, req.admin); }
    @Patch('courses/:id') edit(@Param('id') id:string,@Body() dto:CourseEdit){return this.platform.editCourse(id,dto);}
    @Delete('courses/:id') remove(@Param('id') id:string){return this.platform.removeCourse(id);}
    @Post('courses/:id/archive') archive(@Param('id') id:string){return this.platform.archiveCourse(id);}
    @Get('history') history(@Req() req:any,@Query('adminId') adminId:string){return this.platform.history(req.admin,adminId);}
    @Get('accounts') accounts(@Query('role') role:string,@Req() req:any){return this.platform.accounts(role,req.admin);}
    @Get('accounts/:id') accountDetail(@Param('id') id:string,@Req() req:any){return this.platform.accountDetail(id,req.admin);}
    @Post('accounts') createAccount(@Body() body:any,@Req() req:any){return this.platform.createAccount(body,req.admin);}
    @Post('accounts/:id/verification') verifyOrganization(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.platform.verifyOrganization(id,body,req.admin);}
    @Patch('accounts/:id') editAccount(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.platform.editAccount(id,body,req.admin);}
    @Delete('accounts/:id') deleteAccount(@Param('id') id:string,@Req() req:any){return this.platform.deleteAccount(id,req.admin);}
    @Post('disputes/:id/transition') transition(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.platform.transitionDispute(id,body,req.admin);}
    @Get('executive') executive(@Req() req:any){return this.platform.executive(req.admin);}
    @Post('payouts') payout(@Body() body:any,@Req() req:any){return this.platform.payout(body,req.admin);}
    @Get('finance') finance(){return this.platform.finance();}
    @Get('payments/export')
    export(
    @Query()
    query: AdminQuery) { return this.platform.exportPayments(query); }
    @Get('payments')
    payments(
    @Query()
    query: AdminQuery) { return this.platform.payments(query); }
}
@Controller('public')
export class PublicController {
    constructor(private readonly platform: PlatformService) { }
    @Get('demo-credentials') demo(@Query('role') role:string){return this.platform.demoCredentials(role);}
    @Get('landing')
    landing() { return this.platform.landing(); }
}
