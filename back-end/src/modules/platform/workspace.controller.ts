import {OperationsService} from './operations.service';
import { Body, Controller, Get, Param, Patch, Post, Delete, Req, Query, NotFoundException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspace:WorkspaceService,private readonly operations:OperationsService) {}
  @Get('organization/support') async support(@Req() req:any){return this.operations.support(await this.workspace.identity(req.headers));}
  @Post('organization/support') async createSupport(@Req() req:any,@Body() body:any){return this.operations.createSupport(await this.workspace.identity(req.headers),body);}
  @Get('logs/requests/:id') async request(@Req() req:any,@Param('id') id:string){return this.operations.moduleRequest(await this.workspace.identity(req.headers),id);}
  @Get('organization/instructors/:id') async organizationInstructor(@Req() req:any,@Param('id') id:string){return this.operations.instructor(await this.workspace.identity(req.headers),id);}
  @Get('logs/:id') async log(@Req() req:any,@Param('id') id:string){const data=await this.operations.logs(await this.workspace.identity(req.headers),{id});if(!data.items.length)throw new NotFoundException('Log record not found.');return data.items[0];}
  @Get('logs') async logs(@Req() req:any,@Query() query:any){return this.operations.logs(await this.workspace.identity(req.headers),query);}
  @Get('organization/teaching-assignments') async assignments(@Req() req:any){return this.operations.teachingAssignments(await this.workspace.identity(req.headers));}
  @Get('organization/invitation-lookup') async lookup(@Req() req:any,@Query('email') email:string){return this.operations.invitationLookup(await this.workspace.identity(req.headers),email);}
  @Get('organization/learners') async organizationLearners(@Req() req:any){return this.operations.learners(await this.workspace.identity(req.headers));}
  @Get('organization/learners/:id') async organizationLearner(@Req() req:any,@Param('id') id:string){return this.workspace.organizationLearner(await this.workspace.identity(req.headers),id);}
  @Get('instructor') async instructor(@Req() req:any){return this.workspace.instructorWorkspace(await this.workspace.identity(req.headers));}
  @Get('instructor/learners/:id') async learner(@Req() req:any,@Param('id') id:string){return this.workspace.instructorLearner(await this.workspace.identity(req.headers),id);}
  @Get('instructor/reviews') async reviews(@Req() req:any){return this.workspace.instructorReviews(await this.workspace.identity(req.headers));}
  @Post('instructor/reviews/:id/reply') async reply(@Req() req:any,@Param('id') id:string,@Body() body:any){return this.workspace.instructorReply(await this.workspace.identity(req.headers),id,body);}
  @Delete('instructor/reviews/:id/reply') async removeReply(@Req() req:any,@Param('id') id:string){return this.workspace.instructorReply(await this.workspace.identity(req.headers),id,null,true);}
  @Get('account') async account(@Req() req:any){return this.workspace.accountProfile(await this.workspace.identity(req.headers));}
  @Patch('account') async updateAccount(@Req() req:any,@Body() body:any){return this.workspace.updateAccountProfile(await this.workspace.identity(req.headers),body);}
  @Get('session') async session(@Req() req:any){return this.workspace.identity(req.headers);}
  @Get('overview') async overview(@Req() req:any){return this.workspace.overview(await this.workspace.identity(req.headers));}
  @Get('notifications') async inbox(@Req() req:any){return this.workspace.inbox(await this.workspace.identity(req.headers));}
  @Patch('notifications/read-all') async readAll(@Req() req:any){return this.workspace.mark(await this.workspace.identity(req.headers));}
  @Patch('notifications/:id/read') async read(@Req() req:any,@Param('id') id:string){return this.workspace.mark(await this.workspace.identity(req.headers),id);}
  @Delete('notifications/:id') async dismiss(@Req() req:any,@Param('id') id:string){return this.workspace.dismiss(await this.workspace.identity(req.headers),id);}
}
