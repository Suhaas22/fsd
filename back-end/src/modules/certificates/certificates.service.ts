import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>
  ) {}

  async findAll() {
    return this.certificatesRepo.find();
  }

  async findOne(id: string) {
    const cert = await this.certificatesRepo.findById(id);
    if (!cert) {
      // Try search by credentialId
      const byCred = await this.certificatesRepo.findOne({ credentialId: id });
      if (byCred) return byCred;
      throw new NotFoundException(`Certificate '${id}' not found`);
    }
    return cert;
  }

  async verify(credentialId: string) {
    const cert = await this.certificatesRepo.findOne({ credentialId });
    if (!cert) {
      throw new NotFoundException(`Credential ID '${credentialId}' not found on public ledger`);
    }
    return {
      verified: true,
      certificate: cert,
      verificationTimestamp: new Date().toISOString(),
    };
  }

  async create(data: any) {
    return this.certificatesRepo.create({
      id: `cert-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      status: 'Verified',
      ...data,
    });
  }
}
