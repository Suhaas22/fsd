import { Test, TestingModule } from '@nestjs/testing';
import { JsonDatabaseService } from './json-db.service';
import * as fs from 'fs';
import * as path from 'path';

describe('JsonDatabaseService', () => {
  let service: JsonDatabaseService;
  const testDataDir = path.resolve(process.cwd(), './test-data-spec');

  beforeAll(async () => {
    process.env.DATA_DIR = './test-data-spec';
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonDatabaseService],
    }).compile();

    service = module.get<JsonDatabaseService>(JsonDatabaseService);
    await service.onModuleInit();
  });

  afterAll(async () => {
    if (fs.existsSync(testDataDir)) {
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    }
  });

  it('should be defined and initialize seed collections', async () => {
    expect(service).toBeDefined();
    const orgs = await service.getCollection('organizations');
    expect(orgs.length).toBeGreaterThan(0);
    expect(orgs[0].name).toBe('NexusPay Enterprise Academy');
  });

  it('should perform atomic write and read correctly', async () => {
    const testItems = [{ id: 'test-1', name: 'Item 1' }, { id: 'test-2', name: 'Item 2' }];
    await service.setCollection('test_collection', testItems);

    const retrieved = await service.getCollection('test_collection');
    expect(retrieved).toHaveLength(2);
    expect(retrieved[0].id).toBe('test-1');
  });

  it('should support rollback on transaction failure', async () => {
    const initialCourses = await service.getCollection('courses');
    const initialCount = initialCourses.length;

    try {
      await service.runTransaction(async (db) => {
        const courses = await db.getCollection('courses');
        courses.push({ id: 'dummy-course-fail', title: 'Should Rollback' });
        await db.setCollection('courses', courses);

        // Throw intentional error to trigger rollback
        throw new Error('Simulated Transaction Failure');
      });
    } catch (e) {
      expect(e.message).toBe('Simulated Transaction Failure');
    }

    const coursesAfterRollback = await service.getCollection('courses');
    expect(coursesAfterRollback.length).toBe(initialCount);
    expect(coursesAfterRollback.find((c) => c.id === 'dummy-course-fail')).toBeUndefined();
  });

  it('should reset all collections to initial seeds', async () => {
    await service.resetAllCollections();
    const instructors = await service.getCollection('instructors');
    expect(instructors.length).toBeGreaterThanOrEqual(6);
  });
});
