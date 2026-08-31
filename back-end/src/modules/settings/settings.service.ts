import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.SETTINGS)
    private readonly settingsRepo: JsonRepository<any>,
    private readonly dbService: JsonDatabaseService
  ) {}

  async getSettings() {
    const settingsList = await this.settingsRepo.find();
    if (settingsList.length === 0) {
      return this.settingsRepo.create({
        autoApproveEnrollments: true,
        emailAlerts: true,
        royaltyAlerts: true,
        weeklyDigest: false,
        requireTwoFactor: true,
        defaultCurrency: 'USD',
        defaultAccessType: 'Paid Masterclass',
      });
    }
    return settingsList[0];
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const current = await this.getSettings();
    return this.settingsRepo.update(current.id, dto);
  }

  async resetDatabase() {
    await this.dbService.resetAllCollections();
    return {
      message: 'JSON database was successfully restored to default seed datasets',
      resetAt: new Date().toISOString(),
    };
  }

  async getBackup() {
    const snapshot = await this.dbService.exportDatabaseSnapshot();
    return {
      snapshot,
      timestamp: new Date().toISOString(),
    };
  }
}
