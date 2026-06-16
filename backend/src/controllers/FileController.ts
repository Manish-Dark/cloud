import { Request, Response } from 'express';
import multer from 'multer';
import { File } from '../models/File';
import { FileChunk } from '../models/FileChunk';
import { downloadFileFromTelegram, uploadFileToTelegram, deleteFileFromTelegram } from '../services/telegramService';

// Multer: store upload in memory
export const upload = multer({ storage: multer.memoryStorage() });

// GET /api/files?storage_id=xxx
export const getFilesByStorage = async (req: Request, res: Response) => {
  const storage_id = req.query.storage_id as string | undefined;
  try {
    const query = storage_id ? { storage_id } : {};
    const files = await File.find(query);
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// GET /api/files/:id/chunks
export const getFileChunks = async (req: Request, res: Response) => {
  try {
    const chunks = await FileChunk.find({ file_id: req.params.id }).sort({ position: 1 });
    res.status(200).json(chunks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chunks' });
  }
};

// GET /api/chunks/:id/download
export const downloadChunk = async (req: Request, res: Response) => {
  try {
    const chunk = await FileChunk.findById(req.params.id);
    if (!chunk) {
      res.status(404).json({ error: 'Chunk not found' });
      return;
    }
    const data = await downloadFileFromTelegram(chunk.telegram_file_id);
    res.status(200).send(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to download chunk' });
  }
};

// GET /api/files/:id/download
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // 1. Get all chunks sorted by position
    const chunks = await FileChunk.find({ file_id: file._id }).sort({ position: 1 });
    if (!chunks.length) {
      res.status(404).json({ error: 'No chunks found for this file' });
      return;
    }

    // 2. Download and reassemble
    const bufferChunks: Buffer[] = [];
    for (const chunk of chunks) {
      const data = await downloadFileFromTelegram(chunk.telegram_file_id);
      bufferChunks.push(data);
    }

    const fullBuffer = Buffer.concat(bufferChunks);

    // 3. Send to user
    res.setHeader('Content-Disposition', `attachment; filename="${file.path}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.status(200).send(fullBuffer);
  } catch (error: any) {
    console.error('Download failed:', error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// POST /api/files/init  — Initialize a file record before chunked upload
export const initializeFileUpload = async (req: Request, res: Response) => {
  const { path, size, storage_id } = req.body;
  try {
    const fileDoc = new File({
      path,
      size,
      storage_id,
      is_uploaded: false,
    });
    await fileDoc.save();
    res.status(201).json(fileDoc);
  } catch (error) {
    res.status(400).json({ error: 'Failed to initialize upload' });
  }
};

// POST /api/files/:id/chunks — Upload a single chunk to Telegram
export const uploadFileChunk = async (req: Request, res: Response) => {
  const fileId = req.params.id;
  const { position, is_last } = req.body;
  const chunkFile = req.file;

  console.log(`Receiving chunk ${position} for file ${fileId} (is_last: ${is_last})`);

  if (!chunkFile) {
    console.error(`No file in request for chunk ${position}`);
    res.status(400).json({ error: 'No chunk file provided' });
    return;
  }

  try {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      console.error(`File ${fileId} not found for chunk upload`);
      res.status(404).json({ error: 'File record not found' });
      return;
    }

    const ONE_GB = 1 * 1024 * 1024 * 1024;
    const CHUNK_SIZE = fileDoc.size >= ONE_GB
      ? 15 * 1024 * 1024  // 15 MB for files >= 1 GB
      : 25 * 1024 * 1024; // 25 MB for files < 1 GB
    const totalChunks = Math.ceil(fileDoc.size / CHUNK_SIZE);
    const currentChunk = Number(position) + 1;

    // Upload to Telegram
    console.log(`[${currentChunk}/${totalChunks}] Uploading chunk of '${fileDoc.path}' to Telegram...`);
    const { file_id: telegramFileId, message_id: telegramMessageId } = await uploadFileToTelegram(
      chunkFile.buffer,
      `${fileDoc.path}.part${currentChunk}`,
      chunkFile.mimetype
    );

    // Save chunk record
    const chunkDoc = (FileChunk as any).build(
      fileDoc._id,
      telegramFileId,
      telegramMessageId,
      position
    );
    await chunkDoc.save();

    console.log(`[${currentChunk}/${totalChunks}] Successfully saved chunk to database and Telegram.`);

    if (is_last === 'true') {
      fileDoc.is_uploaded = true;
      await fileDoc.save();
      console.log(`✅ All ${totalChunks} chunks uploaded for file '${fileDoc.path}'. Marked as complete.`);
    }

    res.status(201).json({ success: true, telegram_file_id: telegramFileId });
  } catch (error: any) {
    console.error(`Chunk ${position} upload failed:`, error.message);
    res.status(500).json({ error: 'Failed to upload chunk' });
  }
};

// POST /api/files/upload  — real file upload (multipart - ONE SHOT)
export const uploadFile = async (req: Request, res: Response) => {
  const { storage_id } = req.body;
  const uploadedFile = req.file;

  if (!uploadedFile) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  if (!storage_id) {
    res.status(400).json({ error: 'storage_id is required' });
    return;
  }

  try {
    // 1. Create file record in MongoDB (initially not uploaded)
    const fileDoc = new File({
      path: uploadedFile.originalname,
      size: uploadedFile.size,
      storage_id,
      is_uploaded: false,
    });
    await fileDoc.save();

    // 2. Chunking logic — dynamic chunk size based on file size
    // >= 1 GB  → 15 MB chunks (smaller chunks prevent Telegram timeouts for huge files)
    // <  1 GB  → 25 MB chunks (larger chunks reduce round-trips for normal files)
    const ONE_GB = 1 * 1024 * 1024 * 1024;
    const CHUNK_SIZE = uploadedFile.buffer.length >= ONE_GB
      ? 15 * 1024 * 1024
      : 25 * 1024 * 1024;
    const totalChunks = Math.ceil(uploadedFile.buffer.length / CHUNK_SIZE);
    
    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, uploadedFile.buffer.length);
        const chunkBuffer = uploadedFile.buffer.slice(start, end);
        
        // Upload chunk to Telegram
        const { file_id: telegramFileId, message_id: telegramMessageId } = await uploadFileToTelegram(
          chunkBuffer,
          `${uploadedFile.originalname}.part${i + 1}`,
          uploadedFile.mimetype
        );

        // Save chunk record using the new pattern
        const chunkDoc = (FileChunk as any).build(
          fileDoc._id,
          telegramFileId,
          telegramMessageId,
          i
        );
        await chunkDoc.save();
      }

      // 3. Mark file as uploaded
      fileDoc.is_uploaded = true;
      await fileDoc.save();

      res.status(201).json({ file: fileDoc, chunks_uploaded: totalChunks });
    } catch (telegramError: any) {
      console.error('Telegram upload failed:', telegramError.message);
      res.status(201).json({
        file: fileDoc,
        warning: `Partial upload completed. Failed at chunk: ${telegramError.message}`
      });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to save file' });
  }
};

// POST /api/files  — save metadata only (no Telegram upload)
export const createFile = async (req: Request, res: Response) => {
  try {
    const file = new File(req.body);
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create file' });
  }
};

// DELETE /api/files/:id
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    console.log(`Attempting to delete file ${fileId} and its Telegram chunks...`);
    
    // 1. Get all chunks to delete from Telegram
    const chunks = await FileChunk.find({ file_id: fileId });
    console.log(`Found ${chunks.length} chunks to delete.`);
    
    for (const chunk of chunks) {
      if (chunk.telegram_message_id) {
        await deleteFileFromTelegram(chunk.telegram_message_id);
      } else {
        console.warn(`Chunk ${chunk._id} has no telegram_message_id, skipping Telegram deletion.`);
      }
    }

    // 2. Delete from MongoDB
    await File.findByIdAndDelete(fileId);
    await FileChunk.deleteMany({ file_id: fileId });
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Failed to delete file:', error.message);
    res.status(400).json({ error: 'Failed to delete file' });
  }
};
