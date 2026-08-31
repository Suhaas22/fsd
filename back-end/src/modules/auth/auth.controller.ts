import { Controller, Post, Body, Get, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform Sign In (All Roles: Student, Instructor, Org, Admin)' })
  @ApiResponse({ status: 200, description: 'Authentication token and user identity' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change authenticated user password' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Headers('x-user-id') userId: string = 'usr-1'
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@Headers('x-user-id') userId: string = 'usr-1') {
    return this.authService.getMe(userId);
  }
}
