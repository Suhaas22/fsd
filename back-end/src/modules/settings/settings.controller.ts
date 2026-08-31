import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@ApiTags('Settings & Database Governance')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization administrative settings' })
  @ApiResponse({ status: 200, description: 'Returns settings object' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization administrative settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  @Post('reset-database')
  @ApiOperation({ summary: 'Reset all JSON database files to clean initial seed dataset' })
  @ApiResponse({ status: 200, description: 'Database reset successfully' })
  async resetDatabase() {
    return this.settingsService.resetDatabase();
  }

  @Get('backup')
  @ApiOperation({ summary: 'Export complete JSON database snapshot for backup' })
  @ApiResponse({ status: 200, description: 'Returns full database snapshot' })
  async getBackup() {
    return this.settingsService.getBackup();
  }
}
