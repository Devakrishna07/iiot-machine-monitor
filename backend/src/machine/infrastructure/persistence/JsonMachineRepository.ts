import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Machine, MachineProps } from '../../domain/entities/Machine.js';
import { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import { PaginationQuery, PaginatedResult } from '../../../shared/domain/Pagination.js';

export class JsonMachineRepository implements IMachineRepository {
  private filePath: string;
  private cache: Machine[] | null = null;

  constructor(customPath?: string) {
    if (customPath) {
      this.filePath = customPath;
    } else {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      this.filePath = path.resolve(__dirname, '../data/machines.json');
    }
  }

  private async load(): Promise<Machine[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const records: MachineProps[] = JSON.parse(data);
      this.cache = records.map((record) => Machine.create(record));
      return this.cache;
    } catch (error) {
      console.error(`Failed to read seed machines file from ${this.filePath}:`, error);
      return [];
    }
  }

  public async getAll(): Promise<Machine[]> {
    const machines = await this.load();
    return [...machines];
  }

  public async findPaginated(query: PaginationQuery): Promise<PaginatedResult<Machine>> {
    const all = await this.load();

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 8);
    const status = query.status?.toLowerCase().trim();
    const search = query.search?.toLowerCase().trim();

    const filtered = all.filter((m) => {
      const matchesStatus = !status || status === 'all' || m.status === status;
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.id.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const sliced = filtered.slice(startIndex, startIndex + limit);

    return {
      items: sliced,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async getById(id: string): Promise<Machine | null> {
    const machines = await this.load();
    const found = machines.find((m) => m.id === id);
    return found ? found : null;
  }
}
