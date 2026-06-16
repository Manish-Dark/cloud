import { Router } from 'express';
import { getFoldersByStorage, createFolder, deleteFolder } from '../controllers/FolderController';

const router = Router();

router.get('/', getFoldersByStorage);
router.post('/', createFolder);
router.delete('/:id', deleteFolder);

export default router;
