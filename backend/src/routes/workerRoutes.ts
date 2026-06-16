import { Router } from 'express';
import { getAllWorkers, createWorker } from '../controllers/WorkerController';

const router = Router();

router.get('/', getAllWorkers);
router.post('/', createWorker);

export default router;
