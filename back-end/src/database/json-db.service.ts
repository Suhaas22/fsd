import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  initialUsersData,
  initialOrganizationData,
  initialUniversitiesData,
  initialInstructorsData,
  initialInstructorRequestsData,
  initialLearnersData,
  initialStudentsData,
  initialCoursesData,
  initialEnrollmentsData,
  initialQuizzesData,
  initialQuizQuestionsData,
  initialAssignmentsData,
  initialSubmissionsData,
  initialCertificatesData,
  initialTransactionsData,
  initialRefundsData,
  initialReviewsData,
  initialDisputesData,
  initialReportsData,
  initialNotificationsData,
  initialSettingsData,
} from './seeds/initial-data';
import { BaseEntity } from './interfaces/database.interface';

@Injectable()
export class JsonDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(JsonDatabaseService.name);
  private readonly dataDir: string;
  private readonly memoryStore = new Map<string, BaseEntity[]>();
  private readonly fileLocks = new Map<string, Promise<void>>();
  private transactionLock: Promise<any> = Promise.resolve();

  // Default collections and initial seed data mapping
  private readonly defaultSeedMap: Record<string, any[]> = {
    users: initialUsersData,
    organizations: initialOrganizationData,
    universities: initialUniversitiesData,
    instructors: initialInstructorsData,
    instructor_requests: initialInstructorRequestsData,
    learners: initialLearnersData,
    students: initialStudentsData,
    courses: initialCoursesData,
    enrollments: initialEnrollmentsData,
    quizzes: initialQuizzesData,
    quiz_questions: initialQuizQuestionsData,
    assignments: initialAssignmentsData,
    submissions: initialSubmissionsData,
    certificates: initialCertificatesData,
    transactions: initialTransactionsData,
    refunds: initialRefundsData,
    reviews: initialReviewsData,
    disputes: initialDisputesData,
    reports: initialReportsData,
    notifications: initialNotificationsData,
    settings: initialSettingsData,
  };

  constructor() {
    if (process.env.DATA_DIR) {
      this.dataDir = path.resolve(process.cwd(), process.env.DATA_DIR);
    } else {
      const cwdData = path.resolve(process.cwd(), 'data');
      const relData = path.resolve(__dirname, '../../data');
      if (fs.existsSync(cwdData)) {
        this.dataDir = cwdData;
      } else if (fs.existsSync(relData)) {
        this.dataDir = relData;
      } else {
        this.dataDir = cwdData;
      }
    }
  }

  async onModuleInit() {
    this.ensureDataDirectory();
    await this.initializeCollections();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.logger.log(`Initialized JSON database directory at: ${this.dataDir}`);
    }
  }

  private async initializeCollections() {
    for (const [collection, seedData] of Object.entries(this.defaultSeedMap)) {
      const filePath = this.getCollectionFilePath(collection);
      let data: BaseEntity[] = [];

      if (fs.existsSync(filePath)) {
        try {
          const raw = await fs.promises.readFile(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            data = parsed;
            this.logger.log(`Loaded ${data.length} records for collection: '${collection}' from JSON file`);
          } else {
            data = seedData;
            await this.writeCollectionAtomic(collection, data);
            this.logger.log(`Seeded ${data.length} default records for collection: '${collection}'`);
          }
        } catch (error) {
          this.logger.warn(`Failed reading '${collection}.json', seeding default dataset: ${error.message}`);
          data = seedData;
          await this.writeCollectionAtomic(collection, data);
        }
      } else {
        data = seedData;
        await this.writeCollectionAtomic(collection, data);
        this.logger.log(`Created and seeded '${collection}.json' with ${data.length} records`);
      }

      this.memoryStore.set(collection, JSON.parse(JSON.stringify(data)));
    }
  }

  public getCollectionFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  public async getCollection<T extends BaseEntity>(collection: string): Promise<T[]> {
    if (!this.memoryStore.has(collection)) {
      const defaultData = this.defaultSeedMap[collection] || [];
      this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
    }
    return JSON.parse(JSON.stringify(this.memoryStore.get(collection))) as T[];
  }

  public async setCollection<T extends BaseEntity>(collection: string, items: T[]): Promise<void> {
    await this.writeCollectionAtomic(collection, items);
  }

  public getInMemoryData<T extends BaseEntity>(collection: string): T[] {
    if (!this.memoryStore.has(collection)) {
      const defaultData = this.defaultSeedMap[collection] || [];
      this.memoryStore.set(collection, JSON.parse(JSON.stringify(defaultData)));
    }
    return this.memoryStore.get(collection) as T[];
  }

  public setInMemoryData<T extends BaseEntity>(collection: string, data: T[]): void {
    this.memoryStore.set(collection, data);
  }

  public async writeCollectionAtomic<T extends BaseEntity>(
    collection: string,
    data: T[]
  ): Promise<void> {
    this.ensureDataDirectory();
    this.setInMemoryData(collection, data);

    const filePath = this.getCollectionFilePath(collection);
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;

    // Wait on existing lock for this file if present
    const currentLock = this.fileLocks.get(collection) || Promise.resolve();

    const writeOp = currentLock.then(async () => {
      try {
        const serialized = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(tempPath, serialized, 'utf-8');
        await fs.promises.rename(tempPath, filePath);
      } catch (err) {
        if (fs.existsSync(tempPath)) {
          try {
            await fs.promises.unlink(tempPath);
          } catch {
            // ignore cleanup failure
          }
        }
        this.logger.error(`Atomic write failure on collection '${collection}': ${err.message}`, err.stack);
        throw err;
      }
    });

    this.fileLocks.set(collection, writeOp);
    return writeOp;
  }

  public async runTransaction<R>(action: (db?: JsonDatabaseService) => Promise<R>): Promise<R> {
    const prevLock = this.transactionLock;
    let resolveLock: () => void;
    this.transactionLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    await prevLock;
    try {
      const result = await action(this);
      return result;
    } finally {
      resolveLock!();
    }
  }

  public async exportDatabaseSnapshot(): Promise<Record<string, any[]>> {
    const snapshot: Record<string, any[]> = {};
    for (const collection of Object.keys(this.defaultSeedMap)) {
      snapshot[collection] = await this.getCollection(collection);
    }
    return snapshot;
  }

  public async importDatabaseSnapshot(snapshot: Record<string, any[]>): Promise<void> {
    for (const [collection, data] of Object.entries(snapshot)) {
      if (Array.isArray(data)) {
        await this.setCollection(collection, data);
      }
    }
    this.logger.log(`Imported database snapshot containing ${Object.keys(snapshot).length} collections.`);
  }

  public async resetCollection(collection: string): Promise<BaseEntity[]> {
    const seed = this.defaultSeedMap[collection] || [];
    const fresh = JSON.parse(JSON.stringify(seed));
    await this.writeCollectionAtomic(collection, fresh);
    this.logger.log(`Collection '${collection}' reset to factory initial state.`);
    return fresh;
  }

  public async resetAllCollections(): Promise<void> {
    for (const collection of Object.keys(this.defaultSeedMap)) {
      await this.resetCollection(collection);
    }
    this.logger.log(`All ${Object.keys(this.defaultSeedMap).length} database collections reset to factory initial state.`);
  }

  public getCollectionsStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const collection of Object.keys(this.defaultSeedMap)) {
      const records = this.getInMemoryData(collection);
      stats[collection] = records.length;
    }
    return stats;
  }
}
