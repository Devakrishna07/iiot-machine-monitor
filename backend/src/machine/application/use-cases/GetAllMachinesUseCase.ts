import { Machine, MachineStatus } from '../../domain/entities/Machine.js';
import { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import { PaginationQuery, PaginatedResult } from '../../../shared/domain/Pagination.js';

export interface MachineDTO {
  id: string;
  name: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  lastUpdated: string;
}

export function toMachineDTO(machine: Machine): MachineDTO {
  return {
    id: machine.id,
    name: machine.name,
    status: machine.status,
    temperature: machine.temperature,
    vibration: machine.vibration,
    lastUpdated: machine.lastUpdated,
  };
}

export class GetAllMachinesUseCase {
  constructor(private readonly machineRepository: IMachineRepository) {}

  public async execute(query?: PaginationQuery): Promise<PaginatedResult<MachineDTO>> {
    const result = await this.machineRepository.findPaginated(query || {});
    return {
      items: result.items.map(toMachineDTO),
      pagination: result.pagination,
    };
  }
}
