import { Router } from 'express';
import { 
  getFilesByStorage, createFile, deleteFile, upload, uploadFile, 
  downloadFile, getFileChunks, downloadChunk, initializeFileUpload, uploadFileChunk 
} from '../controllers/FileController';

const router = Router();

router.get('/', getFilesByStorage);
router.get('/:id/chunks', getFileChunks);
router.get('/chunks/:id/download', downloadChunk);
router.get('/:id/download', downloadFile);

router.post('/init', initializeFileUpload);
router.post('/:id/chunks', upload.single('file'), uploadFileChunk);

router.post('/upload', upload.single('file'), uploadFile);  // one-shot fallback
router.post('/', createFile);                               // metadata only
router.delete('/:id', deleteFile);

export default router;
