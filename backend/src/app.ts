import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { JsonMachineRepository } from './machine/infrastructure/persistence/JsonMachineRepository.js';
import { GetAllMachinesUseCase } from './machine/application/use-cases/GetAllMachinesUseCase.js';
import { GetMachineByIdUseCase } from './machine/application/use-cases/GetMachineByIdUseCase.js';
import { MachineController } from './machine/presentation/controllers/MachineController.js';
import { createMachineRouter } from './machine/presentation/routes/machine.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dependency Injection & Composition Root
const machineRepository = new JsonMachineRepository();
const getAllMachinesUseCase = new GetAllMachinesUseCase(machineRepository);
const getMachineByIdUseCase = new GetMachineByIdUseCase(machineRepository);
const machineController = new MachineController(getAllMachinesUseCase, getMachineByIdUseCase);

// Mount Domain Routes
app.use('/api/machines', createMachineRouter(machineController));

export default app;
