import { Request, Response, NextFunction } from 'express';
import { GetAllMachinesUseCase } from '../../application/use-cases/GetAllMachinesUseCase.js';
import { GetMachineByIdUseCase, MachineNotFoundError } from '../../application/use-cases/GetMachineByIdUseCase.js';
import { AcknowledgeMachineFaultUseCase } from '../../application/use-cases/AcknowledgeMachineFaultUseCase.js';
import { InvalidStatusTransitionError } from '../../domain/errors/InvalidStatusTransitionError.js';
import { acknowledgeFaultSchema } from '../validators/machine.validators.js';
import { ApiResponse } from '../../../shared/presentation/ApiResponse.js';

export class MachineController {
  constructor(
    private readonly getAllMachinesUseCase: GetAllMachinesUseCase,
    private readonly getMachineByIdUseCase: GetMachineByIdUseCase,
    private readonly acknowledgeMachineFaultUseCase: AcknowledgeMachineFaultUseCase
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.getAllMachinesUseCase.execute({
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 8 : limit,
        status,
        search,
      });

      ApiResponse.paginated(res, result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const machine = await this.getMachineByIdUseCase.execute(id);
      ApiResponse.success(res, machine);
    } catch (error) {
      if (error instanceof MachineNotFoundError) {
        ApiResponse.error(res, error.message, 404, 'MACHINE_NOT_FOUND');
        return;
      }
      next(error);
    }
  };

  public acknowledge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      // Zod Validation
      const validationResult = acknowledgeFaultSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((e) => e.message).join(', ');
        ApiResponse.error(res, errorMessages, 400, 'VALIDATION_ERROR', validationResult.error.format());
        return;
      }

      const { supervisorId, notes } = validationResult.data;

      const updated = await this.acknowledgeMachineFaultUseCase.execute({
        id,
        supervisorId,
        notes,
      });

      ApiResponse.success(res, updated, 'Machine fault acknowledged successfully');
    } catch (error) {
      if (error instanceof MachineNotFoundError) {
        ApiResponse.error(res, error.message, 404, 'MACHINE_NOT_FOUND');
        return;
      }
      if (error instanceof InvalidStatusTransitionError) {
        ApiResponse.error(res, error.message, 400, 'INVALID_STATUS_TRANSITION');
        return;
      }
      next(error);
    }
  };
}
