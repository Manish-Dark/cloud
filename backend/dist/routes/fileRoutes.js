"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FileController_1 = require("../controllers/FileController");
const router = (0, express_1.Router)();
router.get('/', FileController_1.getFilesByStorage);
router.get('/:id/chunks', FileController_1.getFileChunks);
router.get('/chunks/:id/download', FileController_1.downloadChunk);
router.get('/:id/download', FileController_1.downloadFile);
router.post('/init', FileController_1.initializeFileUpload);
router.post('/:id/chunks', FileController_1.upload.single('file'), FileController_1.uploadFileChunk);
router.post('/upload', FileController_1.upload.single('file'), FileController_1.uploadFile); // one-shot fallback
router.post('/', FileController_1.createFile); // metadata only
router.delete('/:id', FileController_1.deleteFile);
exports.default = router;
