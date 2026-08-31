import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async findAll(query: NotificationQueryDto) {
    const { page = 1, limit = 20, search, unreadOnly, category, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (unreadOnly) where.read = false;
    if (category && category !== 'All') where.category = category;

    if (search) {
      where.$or = [
        { title: { $contains: search } },
        { desc: { $contains: search } },
        { category: { $contains: search } },
      ];
    }

    return this.notifsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async getUnreadCount() {
    const count = await this.notifsRepo.count({ read: false });
    return { unreadCount: count };
  }

  async markAsRead(id: string) {
    const notif = await this.notifsRepo.findById(id);
    if (!notif) {
      throw new NotFoundException(`Notification with ID '${id}' not found`);
    }
    return this.notifsRepo.update(id, { read: true });
  }

  async markAllAsRead() {
    const updatedCount = await this.notifsRepo.updateMany({ read: false }, { read: true });
    return { markedCount: updatedCount };
  }

  async create(dto: CreateNotificationDto) {
    const nowIso = new Date().toISOString();
    return this.notifsRepo.create({
      id: `notif-${Date.now()}`,
      title: dto.title,
      desc: dto.desc,
      category: dto.category || 'System',
      time: 'Just now',
      read: false,
      color: dto.color || 'blue',
      createdAt: nowIso,
    });
  }

  async delete(id: string) {
    const notif = await this.notifsRepo.findById(id);
    if (!notif) {
      throw new NotFoundException(`Notification with ID '${id}' not found`);
    }
    return this.notifsRepo.delete(id);
  }
}
