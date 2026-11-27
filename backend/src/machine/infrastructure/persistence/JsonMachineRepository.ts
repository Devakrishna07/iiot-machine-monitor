import fs from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Machine, MachineProps } from '../../domain/entities/Machine.js';
import { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import { PaginationQuery, PaginatedResult } from '../../../shared/domain/Pagination.js';
import { eventStream } from '../../../shared/infrastructure/EventStream.js';

export class JsonMachineRepository implements IMachineRepository {
  private filePath: string;
  private cache: Machine[] | null = null;
  private isWriting = false;

  constructor(customPath?: string) {
    if (customPath) {
      this.filePath = customPath;
    } else {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      this.filePath = path.resolve(__dirname, '../data/machines.json');
    }

    this.setupFileWatcher();
  }

  private setupFileWatcher(): void {
    try {
      let debounceTimeout: NodeJS.Timeout | null = null;
      watch(this.filePath, () => {
        // If we are the ones writing to the file, ignore self-trigger
        if (this.isWriting) return;

        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
          // Invalidate in-memory cache
          this.cache = null;
          await this.load();
          // Broadcast update event to all connected SSE clients
          eventStream.broadcast('machine_update', {
            source: 'disk_change',
            timestamp: new Date().toISOString(),
          });
        }, 150);
      });
    } catch (err) {
      console.warn('Could not initialize file watcher for machines.json:', err);
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

  private async persist(): Promise<void> {
    if (!this.cache) return;
    try {
      this.isWriting = true;
      const plainObjects = this.cache.map((m) => m.toJSON());
      await fs.writeFile(this.filePath, JSON.stringify(plainObjects, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to persist machines to ${this.filePath}:`, error);
      throw error;
    } finally {
      // Release write lock shortly after
      setTimeout(() => {
        this.isWriting = false;
      }, 200);
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
    const found = machines.find((m) => m.id.toLowerCase() === id.toLowerCase());
    return found ? found : null;
  }

  public async update(machine: Machine): Promise<Machine> {
    const machines = await this.load();
    const index = machines.findIndex((m) => m.id.toLowerCase() === machine.id.toLowerCase());

    if (index === -1) {
      throw new Error(`Cannot update machine '${machine.id}' because it was not found.`);
    }

    machines[index] = machine;
    await this.persist();

    // Broadcast SSE update event on successful update
    eventStream.broadcast('machine_update', {
      source: 'api_update',
      machineId: machine.id,
      status: machine.status,
      timestamp: new Date().toISOString(),
    });

    return machine;
  }
}
