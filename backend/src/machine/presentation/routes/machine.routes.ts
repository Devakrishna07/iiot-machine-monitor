import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';

export function createMachineRouter(controller: MachineController): Router {
  const router = Router();

  // SSE Stream route MUST precede /:id to avoid matching 'stream' as an ID
  router.get('/stream', controller.stream);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.patch('/:id/acknowledge', controller.acknowledge);

  return router;
}
