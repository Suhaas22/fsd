import { v4 as uuidv4 } from 'uuid';
import {
  BaseEntity,
  FindOptions,
  IJsonRepository,
  PaginatedResult,
  QueryFilter,
} from './interfaces/database.interface';
import { JsonDatabaseService } from './json-db.service';

export class JsonRepository<T extends BaseEntity> implements IJsonRepository<T> {
  constructor(
    private readonly collectionName: string,
    private readonly dbService: JsonDatabaseService
  ) {}

  public getCollectionName(): string {
    return this.collectionName;
  }

  async find(options: FindOptions<T> = {}): Promise<T[]> {
    let items = await this.dbService.getCollection<T>(this.collectionName);

    // Apply Filter
    if (options.where) {
      items = items.filter((item) => this.matchFilter(item, options.where!));
    }

    // Apply Sorting
    if (options.sort) {
      items = this.applySorting(items, options.sort);
    }

    // Apply Pagination
    if (typeof options.skip === 'number' && options.skip > 0) {
      items = items.slice(options.skip);
    }
    if (typeof options.limit === 'number' && options.limit > 0) {
      items = items.slice(0, options.limit);
    }

    // Apply Selection
    if (options.select && options.select.length > 0) {
      items = items.map((item) => {
        const selected: any = {};
        for (const key of options.select!) {
          selected[key] = item[key];
        }
        return selected;
      });
    }

    return items;
  }

  async findAndCount(options: FindOptions<T> = {}): Promise<PaginatedResult<T>> {
    let items = await this.dbService.getCollection<T>(this.collectionName);

    // Apply Filter
    if (options.where) {
      items = items.filter((item) => this.matchFilter(item, options.where!));
    }

    const total = items.length;

    // Apply Sorting
    if (options.sort) {
      items = this.applySorting(items, options.sort);
    }

    const limit = options.limit && options.limit > 0 ? options.limit : total || 10;
    const skip = options.skip || 0;
    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit) || 1;

    const pagedItems = items.slice(skip, skip + limit);

    return {
      items: pagedItems,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(where: QueryFilter<T>): Promise<T | null> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const found = items.find((item) => this.matchFilter(item, where));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ id } as QueryFilter<T>);
  }

  async create(data: Partial<T>): Promise<T> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const now = new Date().toISOString();

    const id = data.id || `${this.collectionName.substring(0, 3)}-${uuidv4().substring(0, 8)}`;
    const newRecord = {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: now,
    } as T;

    items.unshift(newRecord);
    await this.dbService.setCollection<T>(this.collectionName, items);
    return JSON.parse(JSON.stringify(newRecord));
  }

  async createMany(dataList: Partial<T>[]): Promise<T[]> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const now = new Date().toISOString();
    const createdRecords: T[] = [];

    for (const data of dataList) {
      const id = data.id || `${this.collectionName.substring(0, 3)}-${uuidv4().substring(0, 8)}`;
      const record = {
        ...data,
        id,
        createdAt: data.createdAt || now,
        updatedAt: now,
      } as T;
      createdRecords.push(record);
      items.unshift(record);
    }

    await this.dbService.setCollection<T>(this.collectionName, items);
    return JSON.parse(JSON.stringify(createdRecords));
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedRecord = {
      ...items[index],
      ...data,
      id, // ensure ID cannot be mutated
      updatedAt: new Date().toISOString(),
    } as T;

    items[index] = updatedRecord;
    await this.dbService.setCollection<T>(this.collectionName, items);
    return JSON.parse(JSON.stringify(updatedRecord));
  }

  async updateMany(where: QueryFilter<T>, data: Partial<T>): Promise<number> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    let count = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < items.length; i++) {
      if (this.matchFilter(items[i], where)) {
        items[i] = {
          ...items[i],
          ...data,
          id: items[i].id,
          updatedAt: now,
        };
        count++;
      }
    }

    if (count > 0) {
      await this.dbService.setCollection<T>(this.collectionName, items);
    }
    return count;
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const initialLength = items.length;
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length !== initialLength) {
      await this.dbService.setCollection<T>(this.collectionName, filtered);
      return true;
    }
    return false;
  }

  async deleteMany(where: QueryFilter<T>): Promise<number> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    const filtered = items.filter((item) => !this.matchFilter(item, where));
    const deletedCount = items.length - filtered.length;

    if (deletedCount > 0) {
      await this.dbService.setCollection<T>(this.collectionName, filtered);
    }
    return deletedCount;
  }

  async count(where?: QueryFilter<T>): Promise<number> {
    const items = await this.dbService.getCollection<T>(this.collectionName);
    if (!where) return items.length;
    return items.filter((item) => this.matchFilter(item, where)).length;
  }

  /**
   * Internal query matching logic
   */
  private matchFilter(item: T, filter: QueryFilter<T>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;

    // Handle $or
    if (filter.$or && Array.isArray(filter.$or)) {
      const matchesOr = filter.$or.some((subFilter) => this.matchFilter(item, subFilter));
      if (!matchesOr) return false;
    }

    // Handle $and
    if (filter.$and && Array.isArray(filter.$and)) {
      const matchesAnd = filter.$and.every((subFilter) => this.matchFilter(item, subFilter));
      if (!matchesAnd) return false;
    }

    for (const [key, filterValue] of Object.entries(filter)) {
      if (key === '$or' || key === '$and') continue;

      const itemValue = (item as any)[key];

      if (filterValue && typeof filterValue === 'object' && !Array.isArray(filterValue) && !(filterValue instanceof RegExp) && !(filterValue instanceof Date)) {
        // Operators object
        const opKeys = Object.keys(filterValue);
        for (const op of opKeys) {
          const expected = (filterValue as any)[op];
          switch (op) {
            case '$eq':
              if (itemValue !== expected) return false;
              break;
            case '$ne':
              if (itemValue === expected) return false;
              break;
            case '$gt':
              if (!(itemValue > expected)) return false;
              break;
            case '$gte':
              if (!(itemValue >= expected)) return false;
              break;
            case '$lt':
              if (!(itemValue < expected)) return false;
              break;
            case '$lte':
              if (!(itemValue <= expected)) return false;
              break;
            case '$in':
              if (!Array.isArray(expected) || !expected.includes(itemValue)) return false;
              break;
            case '$nin':
              if (Array.isArray(expected) && expected.includes(itemValue)) return false;
              break;
            case '$regex':
              const regex = expected instanceof RegExp ? expected : new RegExp(expected, 'i');
              if (typeof itemValue !== 'string' || !regex.test(itemValue)) return false;
              break;
            case '$contains':
              if (typeof itemValue !== 'string' || !itemValue.toLowerCase().includes(String(expected).toLowerCase())) {
                return false;
              }
              break;
            case '$exists':
              const exists = itemValue !== undefined && itemValue !== null;
              if (exists !== expected) return false;
              break;
          }
        }
      } else if (filterValue instanceof RegExp) {
        if (typeof itemValue !== 'string' || !filterValue.test(itemValue)) return false;
      } else {
        // Direct equality
        if (itemValue !== filterValue) return false;
      }
    }

    return true;
  }

  /**
   * Internal multi-field sorting
   */
  private applySorting(items: T[], sort: Record<string, any>): T[] {
    const sorted = [...items];
    const sortEntries = Object.entries(sort);

    sorted.sort((a, b) => {
      for (const [field, direction] of sortEntries) {
        const valA = (a as any)[field];
        const valB = (b as any)[field];
        const isAsc = direction === 'ASC' || direction === 'asc' || direction === 1;

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return isAsc ? 1 : -1;
        if (valB === undefined || valB === null) return isAsc ? -1 : 1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return isAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return isAsc ? -1 : 1;
        if (strA > strB) return isAsc ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }
}
