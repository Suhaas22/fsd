export type FilterOperator<T = any> = {
  $eq?: T;
  $ne?: T;
  $gt?: number | Date;
  $gte?: number | Date;
  $lt?: number | Date;
  $lte?: number | Date;
  $in?: T[];
  $nin?: T[];
  $regex?: string | RegExp;
  $contains?: string;
  $exists?: boolean;
};

export type QueryFilter<T> = {
  [P in keyof T]?: T[P] | FilterOperator<T[P]> | any;
} & {
  $or?: QueryFilter<T>[];
  $and?: QueryFilter<T>[];
};

export interface SortOptions<T = any> {
  [field: string]: 'ASC' | 'DESC' | 'asc' | 'desc' | 1 | -1;
}

export interface FindOptions<T = any> {
  where?: QueryFilter<T>;
  sort?: SortOptions<T>;
  skip?: number;
  limit?: number;
  select?: (keyof T)[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IJsonRepository<T extends BaseEntity> {
  find(options?: FindOptions<T>): Promise<T[]>;
  findAndCount(options?: FindOptions<T>): Promise<PaginatedResult<T>>;
  findOne(where: QueryFilter<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  createMany(items: Partial<T>[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateMany(where: QueryFilter<T>, data: Partial<T>): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteMany(where: QueryFilter<T>): Promise<number>;
  count(where?: QueryFilter<T>): Promise<number>;
}
