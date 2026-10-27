import {WorkspaceService} from '../platform/workspace.service';
import { Body, ForbiddenException,BadRequestException, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService,private readonly workspace:WorkspaceService) {}

  @Get()
  @ApiOperation({ summary: 'List all instructors with filtering, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated instructors list' })
  async findAll(@Query() query: InstructorQueryDto) {
    return this.instructorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get instructor details and associated authored courses' })
  @ApiResponse({ status: 200, description: 'Returns instructor profile and courses' })
  async findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register/Add a new instructor' })
  @ApiResponse({ status: 201, description: 'Instructor created successfully' })
  async create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instructor details' })
  @ApiResponse({ status: 200, description: 'Instructor updated successfully' })
  async update(@Param('id') id:string,@Body() dto:UpdateInstructorDto,@Headers('x-user-id') userId:string){
    const actor=await this.workspace.identity({'x-user-id':userId});const instructor=await this.instructorsService.findOne(id);
    if(actor.canonicalRole==='organization'){
      if(!['Active','Suspended'].includes(dto.status)||instructor.organizationId!==actor.profileId||Object.keys(dto).some(key=>key!=='status'))throw new ForbiddenException('Organizations manage access only for their own instructors.');
    }else if(actor.canonicalRole==='instructor'&&actor.profileId===id){if(Object.keys(dto).some(key=>!['name','phone','bio','specialization','department','website','expertise','qualification','experience','educatorType'].includes(key)))throw new ForbiddenException('Institute affiliation is managed through the organization workflow.');}
    else throw new ForbiddenException('Only the instructor can edit their profile.');
    return this.instructorsService.update(id,dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an instructor record' })
  @ApiResponse({ status: 200, description: 'Instructor deleted successfully' })
  async delete(@Param('id') id: string, @Headers('x-role') actor = 'admin') {
    if (['admin','superadmin'].includes(actor.toLowerCase())) throw new BadRequestException('Instructors cannot be removed by Platform Admin.');
    return this.instructorsService.delete(id);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses authored or co-instructed by this instructor' })
  @ApiResponse({ status: 200, description: 'Returns courses list' })
  async getCourses(@Param('id') id: string) {
    return this.instructorsService.getInstructorCourses(id);
  }

  @Post(':id/leave-organization')
  @ApiOperation({ summary: 'Instructor leaves their organization' })
  async leaveOrganization(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.instructorsService.leaveOrganization(id, userId);
  }
}
