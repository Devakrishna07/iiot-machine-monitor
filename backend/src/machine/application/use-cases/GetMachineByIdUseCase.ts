import { Machine, MachineStatus, FaultDetails, TelemetryPoint } from '../../domain/entities/Machine.js';
import { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';

export class MachineNotFoundError extends Error {
  constructor(id: string) {
    super(`Machine with ID '${id}' was not found`);
    this.name = 'MachineNotFoundError';
  }
}

export interface MachineDetailDTO {
  id: string;
  name: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  lastUpdated: string;
  type: string;
  location: string;
  operatingHours: number;
  fault: FaultDetails | null;
  telemetryHistory: TelemetryPoint[];
}

export function toMachineDetailDTO(machine: Machine): MachineDetailDTO {
  return {
    id: machine.id,
    name: machine.name,
    status: machine.status,
    temperature: machine.temperature,
    vibration: machine.vibration,
    lastUpdated: machine.lastUpdated,
    type: machine.type || 'Industrial Machinery',
    location: machine.location || 'Main Plant Floor',
    operatingHours: machine.operatingHours || 0,
    fault: machine.fault || null,
    telemetryHistory: machine.telemetryHistory || [],
  };
}

export class GetMachineByIdUseCase {
  constructor(private readonly machineRepository: IMachineRepository) {}

  public async execute(id: string): Promise<MachineDetailDTO> {
    if (!id || id.trim() === '') {
      throw new Error('Machine ID must be provided');
    }

    const machine = await this.machineRepository.getById(id.trim());
    if (!machine) {
      throw new MachineNotFoundError(id);
    }

    return toMachineDetailDTO(machine);
  }
}
