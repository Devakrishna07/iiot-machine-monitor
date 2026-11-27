import { Machine } from '../entities/Machine.js';
import { PaginationQuery, PaginatedResult } from '../../../shared/domain/Pagination.js';

export interface IMachineRepository {
  getAll(): Promise<Machine[]>;
  findPaginated(query: PaginationQuery): Promise<PaginatedResult<Machine>>;
  getById(id: string): Promise<Machine | null>;
}
