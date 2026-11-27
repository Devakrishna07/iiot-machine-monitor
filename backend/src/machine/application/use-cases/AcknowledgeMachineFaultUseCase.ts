import { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import {
  MachineDetailDTO,
  toMachineDetailDTO,
} from './GetMachineByIdUseCase.js';
import { MachineNotFoundError } from './GetMachineByIdUseCase.js';

export interface AcknowledgeFaultCommand {
  id: string;
  supervisorId: string;
  notes?: string;
}

export class AcknowledgeMachineFaultUseCase {
  constructor(private readonly machineRepository: IMachineRepository) {}

  public async execute(command: AcknowledgeFaultCommand): Promise<MachineDetailDTO> {
    const { id, supervisorId, notes } = command;

    if (!id || id.trim() === '') {
      throw new Error('Machine ID must be provided');
    }

    const machine = await this.machineRepository.getById(id.trim());
    if (!machine) {
      throw new MachineNotFoundError(id);
    }

    // Execute domain invariant transition (throws InvalidStatusTransitionError if not in fault)
    machine.acknowledgeFault(supervisorId, notes);

    // Persist changes
    const updated = await this.machineRepository.update(machine);

    return toMachineDetailDTO(updated);
  }
}
