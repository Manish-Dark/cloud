import { Router } from 'express';
import { getAccessesByStorage, createAccess, updateAccess, deleteAccess } from '../controllers/AccessController';

const router = Router();

router.get('/', getAccessesByStorage);
router.post('/', createAccess);
router.put('/:id', updateAccess);
router.delete('/:id', deleteAccess);

export default router;
