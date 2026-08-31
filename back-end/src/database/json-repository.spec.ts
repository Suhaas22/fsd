import { JsonDatabaseService } from './json-db.service';
import { JsonRepository } from './json-repository';
import * as fs from 'fs';
import * as path from 'path';

describe('JsonRepository', () => {
  let dbService: JsonDatabaseService;
  let repo: JsonRepository<any>;
  const testDataDir = path.resolve(process.cwd(), './test-repo-spec');

  beforeAll(async () => {
    process.env.DATA_DIR = './test-repo-spec';
    dbService = new JsonDatabaseService();
    await dbService.onModuleInit();
    repo = new JsonRepository('courses', dbService);
  });

  afterAll(async () => {
    if (fs.existsSync(testDataDir)) {
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    }
  });

  it('should find items with equality query filter', async () => {
    const items = await repo.find({ where: { category: 'Cloud Architecture' } });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.category === 'Cloud Architecture')).toBe(true);
  });

  it('should support $contains operator (case-insensitive substring)', async () => {
    const items = await repo.find({ where: { title: { $contains: 'architecture' } } });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].title.toLowerCase()).toContain('architecture');
  });

  it('should support $gt and $lte operators', async () => {
    const items = await repo.find({ where: { price: { $gt: 75, $lte: 90 } } });
    expect(items.length).toBeGreaterThan(0);
    items.forEach((i) => {
      expect(i.price).toBeGreaterThan(75);
      expect(i.price).toBeLessThanOrEqual(90);
    });
  });

  it('should support $in operator', async () => {
    const items = await repo.find({ where: { status: { $in: ['Published', 'Draft'] } } });
    expect(items.length).toBeGreaterThan(0);
    items.forEach((i) => {
      expect(['Published', 'Draft']).toContain(i.status);
    });
  });

  it('should support pagination and sorting', async () => {
    const result = await repo.findAndCount({
      skip: 0,
      limit: 2,
      sort: { price: 'DESC' },
    });

    expect(result.items.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThan(0);
  });

  it('should create, update, and delete a record', async () => {
    const created = await repo.create({
      title: 'Jest Testing Course',
      category: 'Software Engineering',
      price: 49.99,
      status: 'Draft',
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Jest Testing Course');

    const updated = await repo.update(created.id, { price: 59.99, status: 'Published' });
    expect(updated?.price).toBe(59.99);
    expect(updated?.status).toBe('Published');

    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });
});
