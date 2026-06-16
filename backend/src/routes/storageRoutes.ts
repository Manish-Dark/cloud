import { Router } from 'express';
import { getAllStorages, createStorage } from '../controllers/StorageController';

const router = Router();

router.get('/', getAllStorages);
router.post('/', createStorage);

export default router;
