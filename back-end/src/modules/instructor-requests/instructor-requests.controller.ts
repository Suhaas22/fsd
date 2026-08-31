import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstructorRequestsService } from './instructor-requests.service';
import {
  CreateTeachingRequestDto,
  InstructorRequestQueryDto,
  RespondTeachingRequestDto,
  WithdrawTeachingRequestDto,
} from './dto/instructor-request.dto';

@ApiTags('Instructor Requests')
@Controller('instructor-requests')
export class InstructorRequestsController {
  constructor(private readonly requestsService: InstructorRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculty course teaching requests' })
  @ApiResponse({ status: 200, description: 'Returns paginated teaching requests' })
  async findAll(@Query() query: InstructorRequestQueryDto) {
    return this.requestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single teaching request details' })
  @ApiResponse({ status: 200, description: 'Returns teaching request details' })
  async findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Send formal course teaching assignment request to professor' })
  @ApiResponse({ status: 201, description: 'Teaching request sent successfully' })
  async create(@Body() dto: CreateTeachingRequestDto) {
    return this.requestsService.create(dto);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Record professor decision (Accept/Decline) and automatically notify college' })
  @ApiResponse({ status: 200, description: 'Request responded successfully' })
  async respond(@Param('id') id: string, @Body() dto: RespondTeachingRequestDto) {
    return this.requestsService.respond(id, dto);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw dispatched faculty teaching request' })
  @ApiResponse({ status: 200, description: 'Request withdrawn successfully' })
  async withdraw(@Param('id') id: string, @Body() dto: WithdrawTeachingRequestDto) {
    return this.requestsService.withdraw(id, dto);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend outreach notification/email to instructor' })
  @ApiResponse({ status: 200, description: 'Outreach resent successfully' })
  async resend(@Param('id') id: string) {
    return this.requestsService.resend(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete teaching request record' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.requestsService.delete(id);
  }
}
