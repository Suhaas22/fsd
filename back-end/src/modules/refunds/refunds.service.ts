import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class RefundsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REFUNDS)
    private readonly refundsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>
  ) {}

  async findAll() {
    return this.refundsRepo.find();
  }

  async findOne(id: string) {
    const ref = await this.refundsRepo.findById(id);
    if (!ref) {
      throw new NotFoundException(`Refund '${id}' not found`);
    }
    return ref;
  }

  async create(data: any) {
    const refund = await this.refundsRepo.create({
      id: `ref-${Date.now()}`,
      status: 'Processed',
      date: new Date().toISOString().split('T')[0],
      ...data,
    });

    if (data.transactionId) {
      await this.transactionsRepo.update(data.transactionId, { status: 'Refunded' });
    }

    return refund;
  }

  async update(id: string, data: any) {
    const updated = await this.refundsRepo.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Refund '${id}' not found`);
    }
    return updated;
  }
}
