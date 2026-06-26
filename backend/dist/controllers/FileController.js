"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.createFile = exports.uploadFile = exports.uploadFileChunk = exports.initializeFileUpload = exports.downloadFile = exports.downloadChunk = exports.getFileChunks = exports.getFilesByStorage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const File_1 = require("../models/File");
const FileChunk_1 = require("../models/FileChunk");
const telegramService_1 = require("../services/telegramService");
// Multer: store upload in memory
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// GET /api/files?storage_id=xxx
const getFilesByStorage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storage_id = req.query.storage_id;
    try {
        const query = storage_id ? { storage_id } : {};
        const files = yield File_1.File.find(query);
        res.status(200).json(files);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});
exports.getFilesByStorage = getFilesByStorage;
// GET /api/files/:id/chunks
const getFileChunks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chunks = yield FileChunk_1.FileChunk.find({ file_id: req.params.id }).sort({ position: 1 });
        res.status(200).json(chunks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chunks' });
    }
});
exports.getFileChunks = getFileChunks;
// GET /api/chunks/:id/download
const downloadChunk = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chunk = yield FileChunk_1.FileChunk.findById(req.params.id);
        if (!chunk) {
            res.status(404).json({ error: 'Chunk not found' });
            return;
        }
        const data = yield (0, telegramService_1.downloadFileFromTelegram)(chunk.telegram_file_id);
        res.status(200).send(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to download chunk' });
    }
});
exports.downloadChunk = downloadChunk;
// GET /api/files/:id/download
const downloadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield File_1.File.findById(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        // 1. Get all chunks sorted by position
        const chunks = yield FileChunk_1.FileChunk.find({ file_id: file._id }).sort({ position: 1 });
        if (!chunks.length) {
            res.status(404).json({ error: 'No chunks found for this file' });
            return;
        }
        // 2. Download and reassemble
        const bufferChunks = [];
        for (const chunk of chunks) {
            const data = yield (0, telegramService_1.downloadFileFromTelegram)(chunk.telegram_file_id);
            bufferChunks.push(data);
        }
        const fullBuffer = Buffer.concat(bufferChunks);
        // 3. Send to user
        res.setHeader('Content-Disposition', `attachment; filename="${file.path}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.status(200).send(fullBuffer);
    }
    catch (error) {
        console.error('Download failed:', error.message);
        res.status(500).json({ error: 'Failed to download file' });
    }
});
exports.downloadFile = downloadFile;
// POST /api/files/init  — Initialize a file record before chunked upload
const initializeFileUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { path, size, storage_id } = req.body;
    try {
        const fileDoc = new File_1.File({
            path,
            size,
            storage_id,
            is_uploaded: false,
        });
        yield fileDoc.save();
        res.status(201).json(fileDoc);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to initialize upload' });
    }
});
exports.initializeFileUpload = initializeFileUpload;
// POST /api/files/:id/chunks — Upload a single chunk to Telegram
const uploadFileChunk = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const fileDoc = yield File_1.File.findById(fileId);
        if (!fileDoc) {
            console.error(`File ${fileId} not found for chunk upload`);
            res.status(404).json({ error: 'File record not found' });
            return;
        }
        const ONE_GB = 1 * 1024 * 1024 * 1024;
        const CHUNK_SIZE = fileDoc.size >= ONE_GB
            ? 15 * 1024 * 1024 // 15 MB for files >= 1 GB
            : 25 * 1024 * 1024; // 25 MB for files < 1 GB
        const totalChunks = Math.ceil(fileDoc.size / CHUNK_SIZE);
        const currentChunk = Number(position) + 1;
        // Upload to Telegram
        console.log(`[${currentChunk}/${totalChunks}] Uploading chunk of '${fileDoc.path}' to Telegram...`);
        const { file_id: telegramFileId, message_id: telegramMessageId } = yield (0, telegramService_1.uploadFileToTelegram)(chunkFile.buffer, `${fileDoc.path}.part${currentChunk}`, chunkFile.mimetype);
        // Save chunk record
        const chunkDoc = FileChunk_1.FileChunk.build(fileDoc._id, telegramFileId, telegramMessageId, position);
        yield chunkDoc.save();
        console.log(`[${currentChunk}/${totalChunks}] Successfully saved chunk to database and Telegram.`);
        if (is_last === 'true') {
            fileDoc.is_uploaded = true;
            yield fileDoc.save();
            console.log(`✅ All ${totalChunks} chunks uploaded for file '${fileDoc.path}'. Marked as complete.`);
        }
        res.status(201).json({ success: true, telegram_file_id: telegramFileId });
    }
    catch (error) {
        console.error(`Chunk ${position} upload failed:`, error.message);
        res.status(500).json({ error: 'Failed to upload chunk' });
    }
});
exports.uploadFileChunk = uploadFileChunk;
// POST /api/files/upload  — real file upload (multipart - ONE SHOT)
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const fileDoc = new File_1.File({
            path: uploadedFile.originalname,
            size: uploadedFile.size,
            storage_id,
            is_uploaded: false,
        });
        yield fileDoc.save();
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
                const { file_id: telegramFileId, message_id: telegramMessageId } = yield (0, telegramService_1.uploadFileToTelegram)(chunkBuffer, `${uploadedFile.originalname}.part${i + 1}`, uploadedFile.mimetype);
                // Save chunk record using the new pattern
                const chunkDoc = FileChunk_1.FileChunk.build(fileDoc._id, telegramFileId, telegramMessageId, i);
                yield chunkDoc.save();
            }
            // 3. Mark file as uploaded
            fileDoc.is_uploaded = true;
            yield fileDoc.save();
            res.status(201).json({ file: fileDoc, chunks_uploaded: totalChunks });
        }
        catch (telegramError) {
            console.error('Telegram upload failed:', telegramError.message);
            res.status(201).json({
                file: fileDoc,
                warning: `Partial upload completed. Failed at chunk: ${telegramError.message}`
            });
        }
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to save file' });
    }
});
exports.uploadFile = uploadFile;
// POST /api/files  — save metadata only (no Telegram upload)
const createFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = new File_1.File(req.body);
        yield file.save();
        res.status(201).json(file);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create file' });
    }
});
exports.createFile = createFile;
// DELETE /api/files/:id
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileId = req.params.id;
        console.log(`Attempting to delete file ${fileId} and its Telegram chunks...`);
        // 1. Get all chunks to delete from Telegram
        const chunks = yield FileChunk_1.FileChunk.find({ file_id: fileId });
        console.log(`Found ${chunks.length} chunks to delete.`);
        for (const chunk of chunks) {
            if (chunk.telegram_message_id) {
                yield (0, telegramService_1.deleteFileFromTelegram)(chunk.telegram_message_id);
            }
            else {
                console.warn(`Chunk ${chunk._id} has no telegram_message_id, skipping Telegram deletion.`);
            }
        }
        // 2. Delete from MongoDB
        yield File_1.File.findByIdAndDelete(fileId);
        yield FileChunk_1.FileChunk.deleteMany({ file_id: fileId });
        res.status(204).send();
    }
    catch (error) {
        console.error('Failed to delete file:', error.message);
        res.status(400).json({ error: 'Failed to delete file' });
    }
});
exports.deleteFile = deleteFile;
